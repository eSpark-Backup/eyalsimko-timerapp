#=================
#CaroTechSolutions
#
#This file runs a tkinter gui to display the main timer program
#A websocket is established in the background for communication to app.
#To simplify firmware updates to one file, do not separate into multiple files
#================



#========
#Imports
#========
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
PATH_LOGO = "NexTime_just_logo.png"
PATH_BACKGROUND = "NexTime_full_logo.png"
VERSION_NUM = 1.3

#============
#Keep wifi data in file on device so it doesn't need to be sent in firmware update
#The app has no way of knowing which device we are actually updating.
def getWifiDataFromFile():
    with open(f"{PATH_PROGRAM_DIRECTORY}/web_config.txt", "r") as f:
        data = f.readline().strip()
        parts = data.split(":")
        return (parts[0], parts[1])


WIFI_SSID, WIFI_PASS = getWifiDataFromFile()
#==============


#===============
#Global variables for Tkinter
#===============
root = None
lblTimer = None
imgLogo = None
imgBackground = None
imgQRCode = None
lblWifiSSID = None
lblWifiPASS = None
lblVersionNum = None
top_rect = None
bottom_rect = None
canvas = None

#===========
#Global variables for webserver
#===========
httpd = None
websocket_server = None
http_thread  = None
websocket_thread = None
websocket_loop = None
lock = threading.Lock()
async_lock = asyncio.Lock()

#===========
# HTTP server
#Serve blank page on 8000
#Start websocket on 80001
#========
PORT = 8000

#========
#Global variables for controlling threads - Timer Thread, and Blink Flashers Thread
#==========
stop_event_blink = threading.Event()
stop_event_timer = threading.Event()
toggle_thread = None
timer_thread = None
timer_running = False
is_blinking = False
GUI_REFRESH_DELAY = 100

#=======
#Global Variables for timer and display
isLogoShowing = False
isBlackoutMode = False
showTimer = True #used to see if we should show timer or message
strCurrentTime = ""
current_timer = 0
current_msg = ""
time_left = 60*60
blink_start_time = -1
blink_length = 15
BLINK_SPEED = 0.5 #the red flashers on the side blink speed. this amount is delayed between blinks in seconds
#=====
#Global font sizes
#=====
FONT_SIZE = 900
FONT_SIZE_1LINES = 430
FONT_SIZE_VERSION = 30
current_font_size = FONT_SIZE


def change_font_size(label, new_size):
    global current_font_size
    
    if current_font_size == new_size:
        return
    #font will jump on screen if you don't clear before chaning size
    label.config(text="")
    current_font = label.cget("font")
    font_family = current_font.split()[0]
    label.config(font=(font_family,new_size))
    current_font_size = new_size


# WebSocket handler
async def handle_websocket(websocket, path):
    global lblTimer, time_left, timer_running, blink_start_time, blink_length,is_blinking, showTimer,strCurrentTime, isLogoShowing, current_timer, current_msg, isBlackoutMode
    print("WebSocket connection established")
    #Todo if timer is running when this happens send the time back
    
    with lock:
        if timer_running:
            json_data = { "time_left":time_left,"blink_start_time":blink_start_time, "blink_length":blink_length}
            msg = f"recover:{json.dumps(json_data)}"
            await websocket.send(msg)
    try:
        async for message in websocket:
            print(f"Received message: {message}")
            if message == "init":
                await websocket.send(f"hello")
                await websocket.send(f"version:{VERSION_NUM}")
                await asyncio.to_thread(removeLogo)
            #This was intended for a button in the app to blink the side flashers
            #I don't know if we actually need this
            elif message == "b":
                if is_blinking:
                    stop_color_toggle()
                else:
                    start_color_toggle()
            elif "reset:" in message:
                if isLogoShowing:
                    removeLogo()
                
                #stop any current tiemr
                timer_running = False
                showTimer = True
                stop_event_timer.set()
                stop_color_toggle()
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
                print(f"Got timer start msg: {time.monotonic()}")
                lblTimer.config(fg="green")
                start_countdown_timer()
                await websocket.send("start")
            elif message == "pause":
                async with async_lock:
                    current_timer = time_left
                stop_countdown_timer()
                stop_color_toggle()
                print("Pause timer")
            elif message == "resume":
                #start countdown timer without resetting time_left so it continues
                start_countdown_timer()
                print("Resume timer")
            elif message == "stop":
                #stop timer and blinking
                timer_running = False
                stop_event_timer.set()
                lblTimer.config(text="")
                if is_blinking:
                    stop_color_toggle()
            elif "blink:" in message:
                blink_start_time = int(message.split(":")[1])
                print(f"Blink start set to {blink_start_time}")
            elif "blink_length:" in message:
                blink_length = int(message.split(":")[1])
                print(f"Blink Length set to {blink_length}")
            elif "msg:" in message:
                showTimer = False
                current_msg = message.split(":")[1]
                showMessage(current_msg)
            elif message == "hide":
                #show the timer again
                showTimer = True
                current_msg = ""
                lblTimer.config(text = "")                               
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
            elif "blackout:" in message:
                val = message.split(":")[1]
                async with async_lock:
                    if val == "on":                        
                        isBlackoutMode = True
                        removeTimerScreen()
                        #stop_color_toggle()
                        ##to avoid tracking multiple states in and out with blackout or message mode, just change font to black so all states are kept but you don't see it on screen
                        #lblTimer.config(fg="black")
                    elif val == "off":
                        isBlackoutMode = False
                        showTimerScreen()
                        #when coming out of blackout mode we could be less than zero so change text color accordingly                    
                        #if int(time_left) <= 0:
                        #    lblTimer.config(fg="red")
                        #else:
                        #    lblTimer.config(fg="green")


    except websockets.exceptions.ConnectionClosed:
        print("Connection dropped")
        #lblTimer.config(text = "")
        #showLogo()
        #todo add stop blinking here
        #stop_color_toggle()
        #stop_countdown_timer()

def showMessage(msg):
    global current_font_size
    lblTimer.config(text = "")
    test_font = font.Font(size=FONT_SIZE)
    
    #calculate biggest size possible
    MIN_FONT_SIZE = 150
    MAX_WIDTH = 3480
    test_lbl = tk.Label(root,text=msg,font=test_font,wraplength=MAX_WIDTH, justify="center")
    test_lbl.update_idletasks()
    
    #assume one word then change after
    max_font = 0
    words = msg.split()
    
    #if only 1 word no need to calculate
    if len(words) == 1:
        max_font = FONT_SIZE_1LINES
    else:
        for i in range(0,len(words)):
            new_text = ' '.join(words[:i]) + "\n" + ' '.join(words[i:])        
            #print("----Trying this text---")
            #print(new_text)
            
            size = 600
            #start at largest size and keep decreasing until it fits
            while size > MIN_FONT_SIZE:
                #print(f"Trying size {size}")
                test_font.configure(size=size)
                test_lbl.config(font = test_font)
                test_lbl.config(text = msg)
                text_width = test_lbl.winfo_reqwidth()
                text_height = test_lbl.winfo_reqheight()
                #print(f"{text_width} x {text_height}")
                
                #if it fits on screen stop trying
                if text_height <= 1500 and text_width <= 3480:
                    #print(f"Font that fits: {size}")
                    if size > max_font:
                        max_font = size
                    break
                
                size -= 100
    test_font.configure(size=max_font)
    current_font_size = max_font
    lblTimer.config(font=test_font)
    lblTimer.config(text=msg)
    test_lbl.destroy()
        
    lblTimer.config(text = msg)


#This function receives the new firmware, saves it, adjusts the auto start script, and reboots
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
    except asyncio.TimeoutError:
        print("Error: Firmware update timed out!")
        return

    if received_size != expected_size:
        print(f"Error file size mismatch - expected {expected_size} but got {received_size}")
        return

    #make sure checksum matches
    checksum = hashlib.sha256(file_data).hexdigest()
    if checksum != expected_checksum:
        print("Error checksum mismatch!")

        print(f"Expected: {expected_checksum}")
        print(f"Actual  : {checksum}")
        return


    #check folder structure is correct, this folder would have to be there for program to run in first place but check anyway
    if not os.path.exists(PATH_PROGRAM_DIRECTORY):
        os.mkdirs(PATH_PROGRAM_DIRECTORY)

    
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


#The start script runs on boot and should point to the new firmware file
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
    loop.run_forever()

#close the webserver correctly on ctrl+c, for development
def signal_handler(sig, frame):
    print("Shutting down gracefully...")
    if httpd:
        httpd.shutdown()
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

#toggle red flashers to black and vice versa
def toggle_color():
    global canvas, is_blinking, isBlackoutMode
    """Function to toggle the color of the top_rect every second."""
    print("Started blinking...")
    while not stop_event_blink.is_set():
        '''
        #if we're in blackout mode should always be black
        if isBlackoutMode:
            canvas.itemconfig(top_rect, fill="black")
            canvas.itemconfig(bottom_rect, fill="black")
        else:   
        '''         
        # Toggle between black and red
        new_color = "black" if canvas.itemcget(top_rect, "fill") == "red" else "red"
        canvas.itemconfig(top_rect, fill=new_color)
        canvas.itemconfig(bottom_rect, fill=new_color)
        # Wait for next blink
        time.sleep(BLINK_SPEED)
    #if we exit this loop turn them off
    canvas.itemconfig(top_rect, fill="black")
    canvas.itemconfig(bottom_rect, fill="black")

#start toggling flashers
def start_color_toggle():
    """Start the color toggle in a separate thread."""
    global toggle_thread, is_blinking
    
    #we should not start another blink if it's already blinking
    if is_blinking:
        print("Flashers already blinking")
        return

    is_blinking = True
    stop_event_blink.clear()
    toggle_thread = threading.Thread(target=toggle_color, daemon=True)
    toggle_thread.start()

#stop toggling flashers
def stop_color_toggle():
    global is_blinking, canvas
    print("stop color toggle")
    
    is_blinking = False
    stop_event_blink.set()
    canvas.itemconfig(top_rect, fill="black")
    canvas.itemconfig(bottom_rect, fill="black")
    print("Stopped blinking...")


def removeTimerScreen():
    global lblTimer
    lblTimer.place_forget()
    stop_color_toggle()
    
def showTimerScreen():
    global lblTimer
    lblTimer.place(relx=0.5, rely=0.5, anchor='center')
    

#remove default screen with logo and qr code
def removeLogo():
    global imgLogo, lblWifiSSID, imgQRCode, lblWifiPASS, isLogoShowing, lblVersionNum, lblTimer
    isLogoShowing = False
    imgLogo.place_forget()
    lblWifiSSID.place_forget()
    lblWifiPASS.place_forget()
    imgQRCode.place_forget()
    lblVersionNum.place_forget()
    lblTimer.place(relx=0.5, rely=0.5, anchor='center')

#show default screen with logo and qrcode
def showLogo():
    global imgLogo, lblWifiSSID, imgQRCode, lblWifiPASS, isLogoShowing, lblVersionNum, lblTimer
    isLogoShowing = True
    lblTimer.place_forget()
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
    #For debugging use this so you can see terminal
    #root.geometry("3840x1100") 
    
    CANVAS_WIDTH = 3840
    CANVAS_HEIGHT = 1100

    # Set the background color to black
    root.configure(bg="black")
    #hide the mouse
    root.config(cursor="none")

    # Create a canvas
    canvas = tk.Canvas(root, width=CANVAS_WIDTH, height = CANVAS_HEIGHT, bg="black", highlightthickness=0)
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

    lblTimer = tk.Label(root,text="", fg="green", bg="black", wraplength=3480)
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

    bottom_rect = canvas.create_rectangle(
        (window_width - rect_width) , 0,
        window_width , rect_height,
        fill="black", outline="")


    #add version number in bottom right corner
    lblVersionNum = tk.Label(root,text=f"V{VERSION_NUM}", fg="white", bg="black")
    #bottom right corner
    lblVersionNum.place(relx=0.95, rely=0.95, anchor='center')
    lblVersionNum.config(font=font.Font(size=FONT_SIZE_VERSION))


    #put the background on
    #img_back = Image.open(f"{PATH_PROGRAM_DIRECTORY}/{PATH_BACKGROUND}")
    #photo_back = ImageTk.PhotoImage(img_back)
    #create label to display image
    #imgBackground = tk.Label(root,image=photo_back,bg="black")
    #imgBackground.place(relx=0.5, rely=0.5, anchor='center')

    #put the logo on
    img = Image.open(f"{PATH_PROGRAM_DIRECTORY}/{PATH_LOGO}")
    #img = img.convert("RGBA")
    print(f"Image mode: {img.mode}")
    #resize image
    new_width = int(root.winfo_screenwidth() * 0.4)
    width_percent = (new_width / float(img.size[0]))
    new_height = int((float(img.size[1]) * float(width_percent)))
    resizedImg = img.resize((new_width,new_height), Image.Resampling.LANCZOS)
    photo = ImageTk.PhotoImage(resizedImg)
    #create label to display image
    imgLogo = tk.Label(root,image=photo, bg="black")
    imgLogo.place(relx=0.5, rely=0.5, anchor='center')
    #canvas.create_image(10,10,image=photo)
    

    #make qrcode label
    qr_image = generate_qr_code()
    qr_image = qr_image.resize((700,700), Image.Resampling.LANCZOS)
    tk_image = ImageTk.PhotoImage(qr_image)
    imgQRCode = tk.Label(root,image=tk_image,bg="black")
    imgQRCode.place(relx=0.85,rely=0.5,anchor="center")
    #setup wifi label
    #to confirm PI is setup correctly get hostname rather than use WIFI variable
    hostname = socket.gethostname()
    lblWifiSSID =tk.Label(root,text=f"SSID:{hostname}", fg="white", bg="black")
    lblWifiSSID.config(font=font.Font(size=70))
    lblWifiSSID.place(relx=0.15, rely=0.45, anchor='center')
    #canvas.create_window(0.15 * CANVAS_WIDTH,0.45 * CANVAS_HEIGHT,window=lblWifiSSID,anchor="center")

    lblWifiPASS =tk.Label(root,text=f"PSWD:{WIFI_PASS}", fg="white", bg="black")
    #lblWifiPASS =tk.Label(root,text="TEST", fg="white", bg="black")
    lblWifiPASS.config(font=font.Font(size=70))
    lblWifiPASS.place(relx=0.15, rely=0.55, anchor='center')


    #bind ESC to exit
    root.bind('<Escape>', lambda e: signal_handler(signal.SIGINT,None))
    # Bind the custom function to the window close event
    root.protocol("WM_DELETE_WINDOW", on_closing)
    
    
    #testing text
    #removeLogo();
    #showMessage("Hold mic closer to mouth")
    #time_left = 60*60
    #lblTimer.config(fg="green")
    #change_font_size(lblTimer,FONT_SIZE)
    #start_countdown_timer()
    root.mainloop()

def start_countdown_timer():
    global timer_running, time_left, timer_thread
    if not timer_running:
        timer_running = True
        stop_event_timer.clear()
        timer_thread = threading.Thread(target=clock_countdown, daemon=True)
        timer_thread.start()
        update_gui_time()

def stop_countdown_timer():
    global timer_running
    timer_running = False
    stop_event_timer.set()

def update_gui_time():
    global time_left, lblTimer, timer_running, showTimer, strCurrentTime, root, isBlackoutMode
    #print(f"UpdateGui: blackout:{isBlackoutMode}  showTimer:{showTimer}")
    with lock:
        if not timer_running:
            return;
        if isBlackoutMode:            
            root.after(GUI_REFRESH_DELAY,update_gui_time)
            return
        
    
    #we ned a show time so that we can negate the time when we turn it red and show it counting up
    with lock:
        time_to_show = abs(round(time_left))
        
        
        #we can show messages or enter blackout mode while the "timer is up"
        #if we're at 0 or less make text red
        if int(time_left) <= 0 and lblTimer.cget("fg") != "red":
            #if timer color is not green already switch it
            lblTimer.config(fg="red")
            
        #if we're in the 4 seconds after timer is up and we haven't shown Time is up yet show it
        if int(time_left) <= 0 and int(time_left) > -4:
            showTimer = False
            #if text is not correct yet fix it
            if lblTimer.cget("text") != "Time is up!":
                #font will jump if you dont clear it first
                lblTimer.config(text="")
                change_font_size(lblTimer,FONT_SIZE_1LINES  )
                lblTimer.config(text="Time is up!")
            #if we are not blinking yet blink
            if not is_blinking:
                start_color_toggle()
        elif int(time_left) <= -4:
            showTimer = True
            if is_blinking:
                stop_color_toggle()

        #grab minutes seconds
        minutes, seconds = divmod(time_to_show, 60)
        #format the time
        time_formatted = f"{minutes:02}:{seconds:02}"
        strCurrentTime = time_formatted
        if lblTimer and showTimer:
            #fix the font size if we just came out of a message
            #todo store global current font, check if it's not size for timer and only change then
            change_font_size(lblTimer,FONT_SIZE)
            lblTimer.config(text=time_formatted)
        #check if we should start/stop blinking, we blink for a bit when you hit zero so this only needs to happen before 0 hit
        if blink_start_time != -1 and int(time_left) > 0:
            #if we are in the range of blinking and the color toggle isn't currently running then start it
            if time_left <= blink_start_time and time_left >= blink_start_time - blink_length and not is_blinking:
                start_color_toggle()
            #if we are below the blink range and still blinking, turn off
            elif time_left < blink_start_time - blink_length and is_blinking:
                stop_color_toggle()
            
    root.after(GUI_REFRESH_DELAY,update_gui_time)
            
        

def clock_countdown():
    global time_left, timer_running, current_timer
    #local_time = time_left
    #prev_local_time = time_left
    #timer_start_time = time.monotonic() - .2
    #tick_start= time.monotonic()
    #print(f"Timer Starting: {tick_start}")
    timer_start_time = time.monotonic() 
    while not stop_event_timer.is_set():
        if timer_running:
            #tick_start = time.monotonic()  
            #time.sleep(0.01)
            elapsed = time.monotonic() - timer_start_time
            with lock:
                #time_left = time.monotonic() - tick_start
                time_left = current_timer - elapsed



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