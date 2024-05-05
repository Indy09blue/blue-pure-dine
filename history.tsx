import {
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { Text as StyledText, View as StyledView } from "@/components/Themed";
import { dietaryOptions } from "@/components/DietaryPreferences";

import { useFocusEffect } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { CheckIcon, XIcon } from "lucide-react-native";
import { db, auth } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { useScannedProducts } from "@/contexts/ScannedProductsContext";

type Product = {
  code: string;
  selected_images: {
    front: {
      display: { en: string };
      small: { en: string };
      thumb: { en: string };
    };
  };
  product_name: string;
  ingredients_text_with_allergens: string;
  allergens: string[];
  allergens_tags?: string[];
};

type ProductResponse = {
  status: number;
  code: string;
  product?: Product;
};

const screenWidth = Dimensions.get("window").width;
const productWidth = (screenWidth - 40) / 2;

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [dietaryPreferences, setDietaryPreferences] = useState({});
  const { products } = useScannedProducts();

  useEffect(() => {
    const fetchDietaryPreferences = async () => {
      if (auth.currentUser) {
        const userPrefDoc = doc(db, "users", auth.currentUser.uid);
        const userSnapshot = await getDoc(userPrefDoc);
        if (userSnapshot.exists()) {
          setDietaryPreferences(userSnapshot.data().dietaryPreferences);
        } else {
          console.log("No such document!");
        }
      }
      setLoading(false);
    };

    fetchDietaryPreferences();
  }, []);

  const checkCompliance = (allergenTags: string[], preferences: any) => {
    for (const [preference, isActive] of Object.entries(preferences)) {
      if (isActive) {
        const option = dietaryOptions.find(
          (option) => option.key === preference
        );

        // Only proceed if keywords exist
        if (option?.keywords) {
          // Check if any of the allergen tags match the keywords
          if (
            allergenTags.some((allergenTag) =>
              option.keywords.includes(allergenTag.replace("en:", ""))
            )
          ) {
            return false; // found an allergen, return false (X mark)
          }
        }
      }
    }
    return true; // no allergens found, return true (check mark)
  };

  return (
    <StyledView style={styles.container}>
      <ScrollView style={{ paddingTop: 70 }}>
        <StyledText style={styles.title}>History</StyledText>
        <View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#F4B342"
              style={{
                marginTop: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const compliant = checkCompliance(
                  item.allergens_tags || [],
                  dietaryPreferences
                );
                const Icon = compliant ? CheckIcon : XIcon;
                const imageUrl =
                  item.selected_images?.front?.small?.en ||
                  "https://via.placeholder.com/200";
                return (
                  <View style={styles.productContainer}>
                    <Image
                      source={{
                        uri: imageUrl,
                      }}
                      style={styles.image}
                    />
                    <View style={styles.productContent}>
                      <View
                        style={[compliant ? styles.checkIcon : styles.xIcon]}
                      >
                        <Icon strokeWidth={2.5} color="#000" />
                      </View>
                      <Text
                        style={styles.productText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.product_name}
                      </Text>
                    </View>
                  </View>
                );
              }}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.listWrapper}
            />
          ) : (
            <View style={styles.centeredMessageContainer}>
              <StyledText style={styles.centeredMessageText}>
                No Product Scanned
              </StyledText>
            </View>
          )}
        </View>
      </ScrollView>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9AEF65",
    borderRadius: 999,
    padding: 2,
    width: 30,
    height: 30,
  },
  xIcon: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E83E3D",
    borderRadius: 999,
    padding: 2,
    width: 30,
    height: 30,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredMessageText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center", // Ensure the text itself is centered if it wraps to a new line
  },
  listWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  productContainer: {
    padding: 8,
    backgroundColor: "#E9E9E9",
    alignItems: "center",
    width: productWidth - 10,
    marginHorizontal: 5,
    marginVertical: 10,
    borderRadius: 6,
  },
  productContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  productText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 4,
    flexShrink: 1,
  },
});
