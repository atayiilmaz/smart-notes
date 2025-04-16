import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface BaseButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    style?: ViewStyle;
    textColor?: string;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textColor,
    loading = false,
    disabled = false,
    icon,
}) => {
    const getButtonStyle = (): ViewStyle => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabledButton,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            <View style={styles.contentContainer}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                {loading ? (
                    <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#fff'} />
                ) : (
                    <Text
                        style={[
                            getTextStyle(),
                            textColor && { color: textColor },
                            disabled && styles.disabledText,
                        ]}
                    >
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#5856D6',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    disabledButton: {
        opacity: 0.5,
    },
    primaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    outlineText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledText: {
        opacity: 0.5,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
}); 