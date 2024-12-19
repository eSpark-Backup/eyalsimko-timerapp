import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { MoreVertical, Wifi, WifiOff } from "lucide-react-native";
import { Text } from "~/components/ui/text";

export default function TimerScreen() {
  const [speakerName, setSpeakerName] = useState("");
  const [time, setTime] = useState("01:00");
  const [isRunning, setIsRunning] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <StatusBar style="light" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-brand p-4 flex flex-col gap-4">
          <View className="flex flex-row justify-between items-center">
            <View className="flex flex-col gap-2">
              <View className="border border-primary-foreground px-2 py-1">
                <Text className="text-primary-foreground text-lg font-light">
                  one up group
                </Text>
              </View>
              <Text className="text-primary-foreground text-xl font-semibold">
                Event:Description
              </Text>
            </View>
            <View className="flex flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground"
              >
                <Wifi className="h-4 w-4 mr-2" />
                <Text className="text-primary-foreground">WIRELESS</Text>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                <Text className="text-primary-foreground">WIRED</Text>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View className="flex flex-row justify-between p-4 gap-4">
          <Button variant="outline" className="flex-1 bg-primary">
            <Text className="text-primary-foreground">Prev</Text>
          </Button>
          <Button variant="outline" className="flex-1 bg-primary">
            <Text className="text-primary-foreground">Next</Text>
          </Button>
        </View>

        {/* Main Content */}
        <Card className="mx-4 bg-background">
          <CardContent className="p-6 flex flex-col gap-8">
            <View className="flex flex-col gap-4">
              <View className="flex flex-row items-baseline gap-4">
                <Text className="text-2xl font-bold text-brand">Timer 1:</Text>
                <Input
                  placeholder="Speaker Name"
                  value={speakerName}
                  onChangeText={setSpeakerName}
                  className="flex-1 border-b border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 text-xl text-primary"
                />
              </View>
            </View>

            <View className="flex flex-col gap-8">
              <View>
                <Text className="text-xl font-semibold mb-2 text-primary">
                  Countdown Time:
                </Text>
                <Text className="text-2xl text-muted-foreground">
                  Enter time
                </Text>
              </View>
              <View>
                <Text className="text-xl font-semibold mb-2 text-primary">
                  Blink Start Time:
                </Text>
                <Text className="text-3xl font-bold text-brand">01:00</Text>
              </View>
            </View>

            <View className="flex flex-col gap-4">
              <View className="flex flex-row gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 bg-secondary"
                  onPress={() => setIsRunning(true)}
                >
                  <Text className="text-primary text-lg">Start</Text>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 bg-secondary"
                  onPress={() => setIsRunning(false)}
                >
                  <Text className="text-primary text-lg">Stop</Text>
                </Button>
              </View>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 bg-brand"
                onPress={() => {
                  setIsRunning(false);
                  setTime("01:00");
                }}
              >
                <Text className="text-primary-foreground text-lg">Reset</Text>
              </Button>
            </View>

            <Button
              variant="destructive"
              size="lg"
              className="w-full h-14 bg-brand"
              onPress={() => setShowMessage(!showMessage)}
            >
              <Text className="text-primary-foreground text-lg">
                Show Message
              </Text>
            </Button>

            {showMessage && (
              <Text className="text-2xl font-semibold text-brand border-b border-brand pb-2">
                Time is up!
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
