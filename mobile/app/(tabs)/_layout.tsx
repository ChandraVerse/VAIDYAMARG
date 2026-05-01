import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { COLORS, FONT_SIZE } from '@/constants';
import { useCartStore } from '@/stores/cart.store';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
      <Text
        style={{
          fontSize:   FONT_SIZE.xs,
          color:      focused ? COLORS.primary : COLORS.textMuted,
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarStyle: {
          backgroundColor:    COLORS.surface,
          borderTopColor:     COLORS.border,
          borderTopWidth:     1,
          height:             62,
          paddingBottom:      8,
          paddingTop:         6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon icon="🛒" label="Cart" focused={focused} />
              {totalItems > 0 && (
                <View
                  style={{
                    position:        'absolute',
                    top:             -4,
                    right:           -8,
                    backgroundColor: COLORS.primary,
                    borderRadius:    10,
                    minWidth:        18,
                    height:          18,
                    alignItems:      'center',
                    justifyContent:  'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '700' }}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📦" label="Orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
