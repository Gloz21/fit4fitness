import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

/**
 * SafeAreaView for content inside a full-screen <Modal>. The native SafeAreaView
 * measures 0 insets the first time a modal opens (it isn't attached to the window
 * yet), so headers sit under the status bar until the modal is reopened. The root
 * provider's insets are correct immediately, so pad with those instead.
 */
export function ModalSafeArea({
  children,
  style,
  edges = ['top', 'right', 'bottom', 'left'],
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        style,
        {
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
        },
      ]}
    >
      {children}
    </View>
  );
}
