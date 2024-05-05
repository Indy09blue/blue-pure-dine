import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { Text as StyledText, View as StyledView } from "@/components/Themed";
import { CameraView, useCameraPermissions } from "expo-camera/next";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Modalize } from "react-native-modalize";
import { CameraType } from "expo-camera";
import { Dimensions } from "react-native";

import { X } from "lucide-react-native";
import { CheckIcon, XIcon } from "lucide-react-native";

import {
  dietaryOptions,
  SelectedOptions,
} from "@/components/DietaryPreferences";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config/firebaseConfig";
import { useScannedProducts } from "@/contexts/ScannedProductsContext";

type ProductType = {
  product_name: string;
  brands: string;
  selected_images: {
    front: {
      display: {
        en: string;
      };
    };
  };
  ingredients_text: string;
  allergens_tags?: string[];
};

type DietaryOption = {
  key: string;
  label: string;
};

export default function ScannerScreen() {
  const [facing, setFacing] = useState(CameraType.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [productInfo, setProductInfo] = useState<string | null>(null);
  const [userDietaryPreferences, setUserDietaryPreferences] =
    useState<SelectedOptions>({});
  const { addProduct } = useScannedProducts();

  const modalizeRef = useRef<Modalize>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StyledText
          style={{ textAlign: "center", fontSize: 28, fontWeight: "800" }}
        >
          Before Scanning,
        </StyledText>
        <StyledText
          style={{ textAlign: "center", fontSize: 222, marginTop: 4 }}
        >
          We need your permission to show the camera
        </StyledText>
        <TouchableOpacity
          style={{
            backgroundColor: "#0A53C3",
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
          onPress={requestPermission}
        >
          <StyledText style={{ fontSize: 16 }}>Grant Permission</StyledText>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchUserDietaryPreferences = async (userId: string) => {
    // Retrieve user preferences and set them in state
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserDietaryPreferences(docSnap.data().dietaryPreferences);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: any }) => {
    setScanned(true);
    await fetchDataFromAPI(data);
    if (auth.currentUser) {
      await fetchUserDietaryPreferences(auth.currentUser.uid);
    }
    modalizeRef.current?.open();
    setTimeout(() => setScanned(false), 5000);
  };

  const fetchDataFromAPI = async (barcode: string) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const json = await response.json();
      if (json.status === 1) {
        const product = json.product;
        addProduct(product);
        setProductInfo(JSON.stringify(product));
      } else {
        setProductInfo("Product Not Found");
      }
    } catch (error) {
      setProductInfo("Product not found. :(");
    }
  };

  const checkCompliance = (
    allergensTags: string[]
  ): { [key: string]: boolean } => {
    return dietaryOptions.reduce<{ [key: string]: boolean }>((acc, option) => {
      const isCompliant = !allergensTags.some((tag) =>
        option.keywords.includes(tag.replace("en:", ""))
      );

      acc[option.key] = isCompliant;
      return acc;
    }, {});
  };
  const renderDietaryCompliance = (product: ProductType) => {
    const complianceResults = checkCompliance(product.allergens_tags || []);

    // This is an arrow function, which should be passed to renderItem
    const renderItem = ({ item }: { item: DietaryOption }) => {
      // Define isSelected and isCompliant inside the renderItem function
      const isSelected = userDietaryPreferences[item.key];
      const isCompliant = complianceResults[item.key];

      return (
        <View style={styles.dietaryOptionContainer}>
          <StyledText
            style={[
              styles.dietaryOptionText,
              isSelected && isCompliant ? styles.highlightedText : {},
            ]}
          >
            {item.label}
          </StyledText>
          {isCompliant ? (
            <CheckIcon size={24} color="green" />
          ) : (
            <XIcon size={24} color="red" />
          )}
        </View>
      );
    };

    return (
      <FlatList
        data={dietaryOptions}
        renderItem={renderItem} // Pass the arrow function here
        keyExtractor={(item) => item.key}
        numColumns={2}
        contentContainerStyle={styles.dietaryOptionsList}
        scrollEnabled={false}
      />
    );
  };

  const renderProductDetails = (product: ProductType) => {
    if (!product) {
      return <Text>Loading...</Text>;
    }

    const { product_name, brands, selected_images, ingredients_text } = product;

    return (
      <StyledView style={styles.productDetailsContainer}>
        <Image
          source={{ uri: selected_images.front.display.en }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productTextContainer}>
          <StyledText style={styles.productName}>
            {product_name || "Unknown Product"}
          </StyledText>
          <Text style={styles.productBrand}>
            Brand: {brands || "Unknown Brand"}
          </Text>
          <StyledText style={styles.ingredientsHeading}>Contains:</StyledText>
          <ScrollView
            style={{
              height: 120,
              borderColor: "#666666",
              borderWidth: 4,
            }}
            contentContainerStyle={{
              padding: 4,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <StyledText style={styles.ingredientsText}>
              {ingredients_text || "Ingredients not available."}
            </StyledText>
          </ScrollView>
          <View style={styles.complianceContainer}>
            <StyledText style={styles.dietaryHeading}>
              Dietary Preferences:
            </StyledText>
            {renderDietaryCompliance(product)}
          </View>
        </View>
      </StyledView>
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            BarCodeScanner.Constants.BarCodeType.qr,
            BarCodeScanner.Constants.BarCodeType.ean13,
          ],
        }}
      >
        <View style={styles.barcodeMarker} />
        <View style={styles.buttonContainer}>
          {scanned && (
            <Button
              onPress={() => setScanned(false)}
              title="Tap to Scan Again"
            />
          )}
        </View>
      </CameraView>

      <Modalize
        ref={modalizeRef}
        snapPoint={modalHeight}
        modalHeight={modalHeight}
        modalStyle={styles.modalStyle}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          contentContainerStyle: styles.modalContainerContent,
        }}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => modalizeRef.current?.close()}
        >
          <X color="#5071A5" size={32} strokeWidth={2.2} />
        </TouchableOpacity>
        {productInfo ? (
          renderProductDetails(JSON.parse(productInfo))
        ) : (
          <Text>Loading...</Text>
        )}
      </Modalize>
    </View>
  );
}

const screenHeight = Dimensions.get("window").height;
const modalHeight = screenHeight * 0.8;

const styles = StyleSheet.create({
  barcodeMarker: {
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 250,
    height: 150,
    transform: [{ translateY: -75 }, { translateX: -125 }],
  },
  separator: {
    marginTop: 16,
    height: 1,
    width: "100%",
  },
  productDetailsContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  productImage: {
    width: 380,
    height: 380,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 20,
  },
  productTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    flexShrink: 1,
    marginTop: 4,
  },
  productBrand: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  ingredientsHeading: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    fontSize: 16,
  },
  ingredientsText: {
    fontSize: 14,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  modalStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalContainerContent: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  dietaryHeading: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 16,
  },
  dietaryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dietaryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  dietaryOptionContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    margin: 4,
  },
  dietaryOptionsList: {
    paddingHorizontal: 0,
  },

  complianceContainer: {
    marginTop: 2,
  },
  highlightedText: {
    fontWeight: "bold",
    color: "#1170ff", // Use a color that stands out
    backgroundColor: "#38fcffdd", // Optionally add a background color
  },

  closeButton: {
    position: "absolute",
    top: 4,
    right: -2,
    padding: 10,
    zIndex: 2,
  },
});
