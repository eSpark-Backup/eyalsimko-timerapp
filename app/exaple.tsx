import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { MoreVertical, Wifi, WifiOff } from "lucide-react-native";

export default function TimerScreen() {
  const [speakerName, setSpeakerName] = useState("");
  const [time, setTime] = useState("01:00");
  const [isRunning, setIsRunning] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <StatusBar style="light" />
      <ScrollView className="flex grow gap-12">
        {/* Header */}
        <View className="bg-orange-500 p-4">
          <View className="flex-row justify-between items-center">
            <View className="space-y-2">
              <View className="border border-white px-2 py-1">
                <Text className="text-white text-lg font-light tracking-wider">
                  one up group
                </Text>
              </View>
              <Text className="text-white text-xl font-semibold">
                Event:Description
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white">
                <Wifi className="h-4 w-4 mr-2" />
                <Text className="text-white">WIRELESS</Text>
              </Button>
              <Button variant="ghost" size="sm" className="text-white">
                <WifiOff className="h-4 w-4 mr-2" />
                <Text className="text-white">WIRED</Text>
              </Button>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View className="flex-row justify-between p-4">
          <Button variant="outline" className="w-24 bg-gray-200">
            <Text className="text-gray-700">Prev</Text>
          </Button>
          <Button variant="outline" className="w-24 bg-gray-200">
            <Text className="text-gray-700">Next</Text>
          </Button>
        </View>

        {/* Main Content */}
        <Card className="mx-4">
          <CardContent className="p-6 flex gap-8">
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl font-bold text-orange-500">
                Timer 1:
              </Text>
              <Input
                placeholder="Speaker Name"
                value={speakerName}
                onChangeText={setSpeakerName}
                className="flex-1 border-b border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 text-xl"
              />
            </View>

            <View className="flex gap-8">
              <View>
                <Text className="text-xl font-semibold mb-2 text-primary">
                  Countdown Time:
                </Text>
                <Text className="text-2xl text-primary">Enter time</Text>
              </View>
              <View>
                <Text className="text-xl font-semibold mb-2">
                  Blink Start Time:
                </Text>
                <Text className="text-3xl font-bold text-orange-500">
                  01:00
                </Text>
              </View>
            </View>

            <View className="flex gap-6">
              <View className="flex-row gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 bg-gray-200"
                  onPress={() => setIsRunning(true)}
                >
                  <Text className="text-gray-700 text-lg">Start</Text>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 bg-gray-200"
                  onPress={() => setIsRunning(false)}
                >
                  <Text className="text-gray-700 text-lg">Stop</Text>
                </Button>
              </View>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-14 bg-orange-500"
                onPress={() => {
                  setIsRunning(false);
                  setTime("01:00");
                }}
              >
                <Text className="text-white text-lg">Reset</Text>
              </Button>
            </View>

            <Button
              variant="destructive"
              size="lg"
              className="w-full h-14 bg-orange-500"
              onPress={() => setShowMessage(!showMessage)}
            >
              <Text className="text-white text-lg">Show Message</Text>
            </Button>

            {showMessage && (
              <Text className="text-2xl font-semibold text-orange-500 border-b border-orange-300 pb-2">
                Time is up!
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
