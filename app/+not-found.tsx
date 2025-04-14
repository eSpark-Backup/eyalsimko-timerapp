import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View>
        <Text className="font-normal font-poppins web:font-poppins">This screen doesn't exist.</Text>

        <Link href='/'>
          <Text className="font-normal font-poppins web:font-poppins">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
