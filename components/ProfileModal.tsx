import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { X, LogOut, User as UserIcon, Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: ProfileModalProps) {
    const { colors, isDarkMode } = useTheme();
    const { user, signIn, signOut } = useAuth();
    const [name, setName] = useState('');

    const handleCreateProfile = async () => {
        if (name.trim().length === 0) {
            Alert.alert('Hata', 'Lütfen bir isim giriniz.');
            return;
        }
        await signIn(name);
        setName('');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {user ? (
                            // Logged In View
                            <View style={styles.profileContainer}>
                                <Image
                                    source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
                                    style={styles.avatar}
                                />
                                <Text style={[styles.userName, { color: colors.text }]}>{user.displayName || 'Kullanıcı'}</Text>

                                <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#333' : '#F3F4F6' }]}>
                                    <Text style={[styles.infoText, { color: colors.text }]}>
                                        Yerel profiliniz aktif. Verileriniz bu cihazda saklanıyor.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.logoutButton, { borderColor: colors.danger }]}
                                    onPress={() => {
                                        signOut();
                                        onClose();
                                    }}
                                >
                                    <LogOut size={18} color={colors.danger} style={{ marginRight: 8 }} />
                                    <Text style={[styles.logoutText, { color: colors.danger }]}>Profili Sil</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Guest View / Create Profile
                            <View style={styles.guestContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                                    <UserIcon size={32} color="#0284C7" />
                                </View>
                                <Text style={[styles.guestTitle, { color: colors.text }]}>Profil Oluştur</Text>
                                <Text style={[styles.guestDesc, { color: colors.textSecondary }]}>
                                    Uygulamayı kişiselleştirmek için bir isim belirleyin.
                                </Text>

                                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="İsminiz"
                                        placeholderTextColor={colors.textSecondary}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                                    onPress={handleCreateProfile}
                                >
                                    <Check size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.createButtonText}>Oluştur</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    // Profile Styles
    profileContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    userName: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        marginBottom: 16,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        width: '100%',
    },
    infoText: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        width: '100%',
        justifyContent: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    // Guest Styles
    guestContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    guestTitle: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        marginBottom: 8,
    },
    guestDesc: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    inputContainer: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 50,
        justifyContent: 'center',
    },
    input: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
    },
    createButtonText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#FFF',
    },
});
