import React, { useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const { width } = Dimensions.get("window");
const scanSize = width * 0.7;

export default function BarcodeScannerModal({
  visible,
  onClose,
  onScan,
}: Readonly<BarcodeScannerModalProps>) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [visible, permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    onClose();
  };

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black justify-center items-center">
          <View className="bg-white p-5 rounded-xl items-center w-[80%]">
            <Text className="text-base mb-5 text-center font-medium">
              {t("camera_permission_required")}
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              className="bg-blue-600 px-5 py-2.5 rounded-lg mb-2.5 w-full items-center"
              accessibilityRole="button"
              accessibilityLabel={t("grant_permission")}
            >
              <Text className="text-white text-base font-semibold">
                {t("grant_permission")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="p-2.5"
              accessibilityRole="button"
              accessibilityLabel={t("close")}
            >
              <Text className="text-blue-600 text-base font-medium">
                {t("close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-black">
        <CameraView
          className="flex-1"
          facing="back"
          mute={true}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8"],
          }}
        />
        <View className="absolute inset-0 bg-black/50 justify-between">
          <View className="flex-row justify-between items-center p-5 pt-[50px]">
            <Text
              className="text-white text-lg font-semibold"
              accessibilityRole="header"
            >
              {t("scan_barcode")}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2"
              accessibilityRole="button"
              accessibilityLabel={t("close")}
            >
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 items-center justify-center pb-24">
            <View
              className="border-2 border-white rounded-xl bg-transparent"
              style={{
                width: scanSize,
                height: scanSize * 0.6,
              }}
              accessibilityLabel={t("barcode_scan_area")}
            />
            <Text className="text-white mt-5 text-sm opacity-80 font-medium">
              {t("barcode_scan_hint")}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
