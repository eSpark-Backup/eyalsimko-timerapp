#start avahi demon to get the controltimerabc.local
#for now use ip address
#http://192.168.0.11:8000/

import asyncio
import websockets
import http.server
import socketserver
import threading
import tkinter as tk
from tkinter import font
import signal
import sys
import time
import socket
from PIL import Image,ImageTk #sudo apt install python3-pil.imagetk
import qrcode #pip install qrcode[pil]
import os
import json
import hashlib

PATH_PROGRAM_DIRECTORY = "/home/pi/OneUpGroup"
VERSION_NUM = 1.1

#Wifi Information
def getWifiDataFromFile():
    with open(f"{PATH_PROGRAM_DIRECTORY}/web_config.txt", "r") as f:
        data = f.readline().strip()
        parts = data.split(":")
        return (parts[0], parts[1])


WIFI_SSID, WIFI_PASS = getWifiDataFromFile()
#WIFI_SSID = "TOUG-PVT2"
#WIFI_PASS = "EQW85ALG"



#Global variables for Tkinter
root = None
lblTimer = None
imgLogo = None
imgQRCode = None
lblWifiSSID = None
lblWifiPASS = None
lblVersionNum = None
top_rect = None
bottom_rect = None
canvas = None

#global variables for webserver
httpd = None
websocket_server = None
http_thread  = None
websocket_thread = None
websocket_loop = None
lock = threading.Lock()
stop_event_timer = threading.Event()
is_firmware_update = False

# HTTP server
PORT = 8000

#global for toggling blinkers
stop_event_blink = threading.Event()
toggle_thread = None

isBlinking = False
isLogoShowing = False
timer_thread = None
timer_running = False
showTimer = True
strCurrentTime = ""
current_timer = 0
time_left = 120
blink_start_time = -1
blink_length = 15
BLINK_SPEED = 0.5
FONT_SIZE = 900
FONT_SIZE_1LINES = 430
FONT_SIZE_2LINES = 350
FONT_SIZE_3LINES = 250
FONT_SIZE_4LINES = 150
FONT_SIZE_VERSION = 30
is_timer_up = -1

LINE_LENGTH = 12

def change_font_size(label, new_size):
    current_font = label.cget("font")
    font_family = current_font.split()[0]
    label.config(font=(font_family,new_size))

def wrap_text_by_space(text):
    global LINE_LENGTH
    words = text.split()
    wrapped_text = ""
    current_line = ""
    for word in words:
        if len(current_line) + len(word) + 1 > LINE_LENGTH:
            wrapped_text += current_line.strip() + '\n'
            current_line = word + " "
        else:
            current_line += word + " "
    wrapped_text += current_line.strip()
    return wrapped_text


# WebSocket handler
async def handle_websocket(websocket, path):
    global lblTimer, time_left, timer_running, blink_start_time, blink_length,isBlinking, showTimer,strCurrentTime, isLogoShowing
    print("WebSocket connection established")
    try:
        async for message in websocket:
            print(f"Received message: {message}")
            if message == "init":
                await websocket.send(f"hello")
                await websocket.send(f"version:{VERSION_NUM}")
                await asyncio.to_thread(removeLogo)
            elif message == "b":
                if isBlinking:
                    stop_color_toggle()
                else:
                    start_color_toggle()
            elif "reset:" in message:
                if isLogoShowing:
                    removeLogo()
                #removeLogo()
                #stop any current tiemr
                timer_running = False
                stop_event_timer.set()
                #parse msg
                current_timer = int(message.split(":")[1])
                #time left is used for timer
                time_left = current_timer
                #convert to minutes seconds
                minutes, seconds = divmod(time_left, 60)
                #format the time string
                time_formatted = f"{minutes:02}:{seconds:02}"
                print(f"Reset timer to {time_formatted}")
                #set the textview with the time
                if lblTimer:
                    lblTimer.config(fg="green")
                    change_font_size(lblTimer,FONT_SIZE)
                    lblTimer.config(text=time_formatted)
            elif message == "start":
                lblTimer.config(fg="green")
                start_countdown_timer()
                await websocket.send("start")
            elif message == "pause":
                stop_countdown_timer()
                stop_color_toggle()
                print("Pause timer")
            elif message == "resume":
                start_countdown_timer()
                print("Resume timer")
            elif message == "stop":
                timer_running = False
                stop_event_timer.set()
                stop_event_blink.set()
                lblTimer.config(text="")
                if isBlinking:
                    stop_color_toggle()
            elif "blink:" in message:
                blink_start_time = int(message.split(":")[1])
                print(f"Blink start set to {blink_start_time}")
            elif "blink_length:" in message:
                blink_length = int(message.split(":")[1])
                print(f"Blink Length set to {blink_length}")
            elif "msg:" in message:
                showTimer = False
                msg = message.split(":")[1]
                lblTimer.config(text = "")
                #change the font size based on the length
                if len(msg) < 12:
                    change_font_size(lblTimer, FONT_SIZE_1LINES)
                elif len(msg) < 20:
                    change_font_size(lblTimer, FONT_SIZE_2LINES)
                elif len(msg) < 30:
                    change_font_size(lblTimer, FONT_SIZE_3LINES)
                else:
                    change_font_size(lblTimer, FONT_SIZE_4LINES)
                msg = wrap_text_by_space(msg)
                lblTimer.config(text = msg)
            elif message == "hide":
                #show the timer again
                showTimer = True
                lblTimer.config(text = "")
                #change_font_size(lblTimer, FONT_SIZE)
                #lblTimer.config(text=strCurrentTime)
            elif message == "shutdown":
                stop_color_toggle()
                stop_countdown_timer()
                showShutdownScreen()
            elif message == "disconnect":
                lblTimer.config(text = "")
                showLogo()
                #todo add stop blinking here
                stop_countdown_timer()
                stop_color_toggle()
            elif message[0] == '{':
                print("Receiving firmware...")
                data = json.loads(message)
                await receive_firmware(websocket,data)


    except websockets.exceptions.ConnectionClosed:
        print("Connection dropped")
        lblTimer.config(text = "")
        showLogo()
        #todo add stop blinking here
        stop_color_toggle()
        stop_countdown_timer()


async def receive_firmware(websocket,metadata):
    filename = metadata["filename"]
    expected_size = metadata["size"]
    expected_checksum = metadata["checksum"]
    version_num = metadata["version"]

    #change screen while updating
    lblTimer.config(text="")
    imgLogo.place(relx=0.5, rely=0.5, anchor='center')
    lblShutdown =tk.Label(root,text=f"Updating to firmware v{version_num} : 0%", fg="white", bg="black")
    lblShutdown.config(font=font.Font(size=70))
    lblShutdown.place(relx=0.5, rely=0.9, anchor='center')
    time.sleep(1)

    file_data=b""
    received_size = 0

    try:
        while True:
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            if  isinstance(message,str):
                data = json.loads(message)
                if "EOF" in data:
                    break
            else:
                file_data += message
                received_size += len(message)
                update_percent = int((received_size/expected_size) * 100)
                print(f"Received {received_size} of {expected_size} : {update_percent}")
                lblShutdown.config(text=f"Updating to firmware v{version_num} : {update_percent}%")
                time.sleep(0.1)
            #TODO? stop if we received expected size?
    except asyncio.TimeoutError:
        print("Error: Firmware update timed out!")
        return

    if received_size != expected_size:
        print(f"Error file size mismatch - expected {expected_size} but got {received_size}")
        return

    #print("---File data---")
    #print(file_data)
    #print("\n\n")

    checksum = hashlib.sha256(file_data).hexdigest()
    if checksum != expected_checksum:
        print("Error checksum mismatch!")

        print(f"Expected: {expected_checksum}")
        print(f"Actual  : {checksum}")
        return


    #check folder structure is correct
    if not os.path.exists(PATH_PROGRAM_DIRECTORY):
        os.mkdirs(PATH_PROGRAM_DIRECTORY)

    #TODO make sure this folder exists? I think all files will move there eventually
    with open(f"{PATH_PROGRAM_DIRECTORY}/{filename}", "wb") as f:
        f.write(file_data)

    #make new script executable
    os.chmod(f"{PATH_PROGRAM_DIRECTORY}/{filename}",0o755)

    update_startup_script(f"{PATH_PROGRAM_DIRECTORY}/{filename}")

    print(f"File {filename} received successfully")
    time.sleep(1)
    lblShutdown.config(text="Rebooting...")
    time.sleep(3)
    os.system("sudo reboot now")



def update_startup_script(filename):
    file_data = f"""
#!/bin/bash
#check if the script is already executable
if [ ! -x {filename} ]; then
    chmod +x {filename}
fi


#run the python script
/usr/bin/python3 {filename}
    """

    with open(f"{PATH_PROGRAM_DIRECTORY}/start_script.sh","w") as f:
        f.write(file_data)

    #make it executable
    os.chmod(f"{PATH_PROGRAM_DIRECTORY}/start_script.sh",0o755)

    print("Updated startup script")


class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'index.html'
        return super().do_GET()

def start_http_server():
    global httpd
    with socketserver.TCPServer(("", PORT), MyHandler) as server:
        httpd = server
        print(f"Serving HTTP on port {PORT}")
        httpd.serve_forever()

def start_websocket_server(loop):
    global websocket_server
    asyncio.set_event_loop(loop)
    start_server = websockets.serve(handle_websocket, "0.0.0.0", PORT + 1)
    websocket_server = loop.run_until_complete(start_server)
    print(f"Serving WebSocket on port {PORT + 1}")
    #asyncio.get_event_loop().run_until_complete(websocket_server)
    #asyncio.get_event_loop().run_forever()
    #loop.run_until_complete(websocket_server)
    loop.run_forever()

#close the webserver correctly on ctrl+c
def signal_handler(sig, frame):
    print("Shutting down gracefully...")
    if httpd:
        httpd.shutdown()
    #if websocket_server:
        #asyncio.get_event_loop().stop()
        #websocket_server.ws_server.close()
    if websocket_loop and websocket_loop.is_running():
        for task in asyncio.all_tasks(loop=websocket_loop):
            task.cancel()
        websocket_loop.call_soon_threadsafe(websocket_loop.stop)
    if http_thread and http_thread.is_alive():
        http_thread.join()
    if websocket_thread and websocket_thread.is_alive():
        #websocket_loop.stop()
        websocket_thread.join()
    sys.exit(0)

def on_closing():
    global root
    print("Window close button pressed.")
    signal_handler(signal.SIGINT,None)
    root.quit()  # You can perform any cleanup tasks here

def toggle_color():
    global canvas, isBlinking
    """Function to toggle the color of the top_rect every second."""
    print("Started blinking...")
    while not stop_event_blink.is_set():
        # Toggle between black and red
        new_color = "black" if canvas.itemcget(top_rect, "fill") == "red" else "red"
        canvas.itemconfig(top_rect, fill=new_color)
        canvas.itemconfig(bottom_rect, fill=new_color)
        # Wait for 1 second
        time.sleep(BLINK_SPEED)

def start_color_toggle():
    """Start the color toggle in a separate thread."""
    global toggle_thread, isBlinking

    #we should not start another blink if it's already blinking
    if isBlinking:
        print("Flashers already blinking")
        return

    isBlinking = True
    stop_event_blink.clear()
    toggle_thread = threading.Thread(target=toggle_color, daemon=True)
    toggle_thread.start()

def stop_color_toggle():
    global isBlinking, canvas
    isBlinking = False
    stop_event_blink.set()
    canvas.itemconfig(top_rect, fill="black")
    canvas.itemconfig(bottom_rect, fill="black")
    """Signal the thread to stop and wait for it to finish."""
    #toggle_thread.join()  # Wait for the thread to complete
    print("Stopped blinking...")

def removeLogo():
    global imgLogo, lblWifiSSID, imgQRCode, lblWifiPASS, isLogoShowing, lblVersionNum
    isLogoShowing = False
    imgLogo.place_forget()
    lblWifiSSID.place_forget()
    lblWifiPASS.place_forget()
    imgQRCode.place_forget()
    lblVersionNum.place_forget()

def showLogo():
    global imgLogo, lblWifiSSID, imgQRCode, lblWifiPASS, isLogoShowing, lblVersionNum
    isLogoShowing = True
    imgLogo.place(relx=0.5, rely=0.5, anchor='center')
    lblWifiSSID.place(relx=0.15, rely=0.45, anchor='center')
    imgQRCode.place(relx=0.85,rely=0.5,anchor="center")
    lblWifiPASS.place(relx=0.15, rely=0.55, anchor='center')
    lblVersionNum.place(relx=0.95, rely=0.95, anchor='center')


def showShutdownScreen():
    global root, imgLogo,lblTimer
    lblTimer.config(text="")
    imgLogo.place(relx=0.5, rely=0.5, anchor='center')
    lblShutdown =tk.Label(root,text=f"Shutting down...", fg="white", bg="black")
    lblShutdown.config(font=font.Font(size=70))
    lblShutdown.place(relx=0.5, rely=0.9, anchor='center')
    time.sleep(3)
    os.system("sudo shutdown now")


def generate_qr_code():
    global WIFI_SSID, WIFI_PASS
    wifi_format=f"WIFI:{WIFI_SSID},PSS:{WIFI_PASS}"
    qr = qrcode.QRCode(
        version = 1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=15,
        border=2
    )
    qr.add_data(wifi_format)
    qr.make(fit=True)
    #create img
    img = qr.make_image(fill="black",back_color="gray")
    return img

def start_tkinter_gui():
    global lblTimer, root, top_rect, bottom_rect, canvas, imgLogo,lblWifiSSID, imgQRCode,lblWifiPASS, lblVersionNum

    root = tk.Tk()
    root.wm_attributes('-fullscreen','true')
    # Set the window size to 800x600 pixels
    #root.geometry("3840x1600") #heigth 1100
    #root.geometry("2400x1100")


    # Set the background color to black
    root.configure(bg="black")
    #hide the mouse
    root.config(cursor="none")

    # Create a canvas
    canvas = tk.Canvas(root, bg="black", highlightthickness=0)
    canvas.pack(fill="both", expand=True)

    # Update the window to ensure it gets the correct dimensions
    root.update_idletasks()

    # Set the window size
    window_width = root.winfo_screenwidth()
    window_height = root.winfo_height() # use screen height for whole screen height

    # Define the dimensions of the rectangles
    rect_width = 150
    rect_height = window_height

    # Calculate the positions for the rectangles
    top_rect_y = 0
    bottom_rect_y = window_height - 50

    lblTimer = tk.Label(root,text="", fg="green", bg="black")
    # Center the label in the window both horizontally and vertically
    lblTimer.place(relx=0.5, rely=0.5, anchor='center')

    # Set the font size of the label
    label_font = font.Font(size=FONT_SIZE)
    lblTimer.config(font=label_font)

    # Draw the rectangles going down
    top_rect = canvas.create_rectangle(
        0, 0,
        rect_width, rect_height,
        fill="black", outline="")

    # Change the background color of the top_rect to black
    #canvas.itemconfig(top_rect, fill="black")

    bottom_rect = canvas.create_rectangle(
        (window_width - rect_width) , 0,
        window_width , rect_height,
        fill="black", outline="")


    #add version number in bottom right corner
    lblVersionNum = tk.Label(root,text=f"V{VERSION_NUM}", fg="white", bg="black")
    #bottom right corner
    lblVersionNum.place(relx=0.95, rely=0.95, anchor='center')
    lblVersionNum.config(font=font.Font(size=FONT_SIZE_VERSION))

    #put the logo on
    #TODO change to root path
    img = Image.open("/home/pi/Documents/Eyal/oneup_logo_white.png")
    #resiz image
    new_width = int(root.winfo_screenwidth() * 0.4)
    width_percent = (new_width / float(img.size[0]))
    new_height = int((float(img.size[1]) * float(width_percent)))
    resizedImg = img.resize((new_width,new_height), Image.Resampling.LANCZOS)
    photo = ImageTk.PhotoImage(resizedImg)
    #create label to display image
    imgLogo = tk.Label(root,image=photo,bg="black")
    imgLogo.place(relx=0.5, rely=0.5, anchor='center')

    #make qrcode label
    qr_image = generate_qr_code()
    qr_image = qr_image.resize((700,700), Image.Resampling.LANCZOS)
    tk_image = ImageTk.PhotoImage(qr_image)
    imgQRCode = tk.Label(root,image=tk_image,bg="black")
    imgQRCode.place(relx=0.85,rely=0.5,anchor="center")
    #setup wifi label
    hostname = socket.gethostname()
    lblWifiSSID =tk.Label(root,text=f"SSID:{hostname}", fg="white", bg="black")
    lblWifiSSID.config(font=font.Font(size=70))
    lblWifiSSID.place(relx=0.15, rely=0.45, anchor='center')

    lblWifiPASS =tk.Label(root,text=f"PSWD:{WIFI_PASS}", fg="white", bg="black")
    #lblWifiPASS =tk.Label(root,text="TEST", fg="white", bg="black")
    lblWifiPASS.config(font=font.Font(size=70))
    lblWifiPASS.place(relx=0.15, rely=0.55, anchor='center')


    #bind ESC to exit
    root.bind('<Escape>', lambda e: signal_handler(signal.SIGINT,None))
    # Bind the custom function to the window close event
    root.protocol("WM_DELETE_WINDOW", on_closing)

    root.mainloop()

def start_countdown_timer():
    global timer_running, time_left, timer_thread
    if not timer_running:
        # Set the timer duration (in seconds)
        #time_left = int(lblTimer.cget("text"))  # Assuming lblTimer starts with the countdown time
        timer_running = True
        #timer_thread = threading.Thread(target=countdown_timer, daemon=True)
        stop_event_timer.clear()
        timer_thread = threading.Thread(target=clock_countdown, daemon=True)
        timer_thread.start()

def stop_countdown_timer():
    global timer_running
    timer_running = False
    stop_event_timer.set()

def update_gui_time():
    global time_left, lblTimer, timer_running, showTimer, strCurrentTime
    #we ned a show time so that we can negate the time when we turn it red and show it counting up
    time_to_show = time_left
    #if negative time make it positive and turn it red
    if time_left <= 0 and showTimer:
        time_to_show = -time_left
        lblTimer.config(text="")
        lblTimer.config(fg="red")

    #check if we should show Time is up
    if time_left == 0 or time_left == -2:
        change_font_size(lblTimer, FONT_SIZE_1LINES)
        lblTimer.config(text="Time is up!")
        #show red bars
        canvas.itemconfig(top_rect, fill="red")
        canvas.itemconfig(bottom_rect, fill="red")
    elif time_left == -1 or time_left == -3:
        lblTimer.config(text="")
        canvas.itemconfig(top_rect, fill="black")
        canvas.itemconfig(bottom_rect, fill="black")
    else:
        #grab minutes seconds
        minutes, seconds = divmod(time_to_show, 60)
        #format the time
        time_formatted = f"{minutes:02}:{seconds:02}"
        strCurrentTime = time_formatted
        if lblTimer and showTimer:
            #fix the font size if we just came out of a message
            current_font = lblTimer.cget("font")
            font_size = int(current_font.split()[1])
            if font_size != FONT_SIZE:
                change_font_size(lblTimer,FONT_SIZE)
            lblTimer.config(text=time_formatted)
    #check if we should start/stop blinking
    if blink_start_time != -1:
        #if we are in the range of blinking and the color toggle isn't currently running then start it
        if time_left <= blink_start_time and time_left >= blink_start_time - blink_length and not isBlinking:
            start_color_toggle()
        #if we are below the blink range and still blinking, turn off
        elif time_left < blink_start_time - blink_length and isBlinking:
            stop_color_toggle()

def clock_countdown():
    global time_left, timer_running
    while not stop_event_timer.is_set():
        if timer_running:
            with lock:
                time_left -=1
                threading.Thread(target=update_gui_time).start()
            #we can't just full second delay here because we may get a pause then start command back to back and miss the stop of the timer actually starting 2 timers
            for _ in range(10):
                if stop_event_timer.is_set():
                    return
                time.sleep(0.1)



if __name__ == "__main__":
    #register sig handler
    signal.signal(signal.SIGINT,signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Start HTTP server in a separate thread
    http_thread = threading.Thread(target=start_http_server)
    http_thread.start()

    # Start WebSocket server in thread
    websocket_loop = asyncio.new_event_loop()
    websocket_thread = threading.Thread(target = start_websocket_server, args=(websocket_loop,))
    websocket_thread.start()

    start_tkinter_gui()
