import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useCartStore } from '../../src/store/cart.store';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        color: focused ? Colors.primary : Colors.textMuted,
        fontWeight: focused ? '600' : '400',
        marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prescription"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📝" label="Rx" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) =>
            <View>
              <TabIcon emoji="🛒" label="Cart" focused={focused} />
              {cartCount > 0 && (
                <View style={{
                  position: 'absolute', top: 0, right: -4,
                  backgroundColor: Colors.error, borderRadius: 8,
                  minWidth: 16, height: 16,
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ color: Colors.white, fontSize: 9, fontWeight: '700' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </View>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Me" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
