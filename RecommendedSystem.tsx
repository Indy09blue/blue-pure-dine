// import React, { useState, useEffect } from "react";
// import { View, Text } from "react-native";
// import { RNCamera } from "react-native-camera";

// function BarcodeScanner({ onBarcodeRead }) {
//   return (
//     <RNCamera
//       style={{ flex: 1 }}
//       type={RNCamera.Constants.Type.back}
//       barCodeTypes={[RNCamera.Constants.BarCodeType.upc_e]}
//       onBarCodeRead={onBarcodeRead}
//     >
//       <View>
//         <Text>Scan a Barcode</Text>
//       </View>
//     </RNCamera>
//   );
// }

// import axios from "axios";

// async function fetchProductData(barcode) {
//   try {
//     const response = await axios.get(
//       `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
//     );
//     return response.data.product;
//   } catch (error) {
//     console.error("Failed to fetch product data:", error);
//     return null;
//   }
// }

// async function findAlternatives(productCategory, userDietaryPrefs) {
//   try {
//     const response = await axios.get(
//       `https://world.openfoodfacts.org/category/${productCategory}.json`
//     );
//     return response.data.products.filter((product) =>
//       checkDietaryCompliance(product.ingredients_text, userDietaryPrefs)
//     );
//   } catch (error) {
//     console.error("Failed to find alternatives:", error);
//     return [];
//   }
// }

// const [userPrefs, setUserPrefs] = useState({ dairyFree: true });

// const handleBarcodeRead = async ({ data: barcode }) => {
//   const product = await fetchProductData(barcode);
//   if (
//     product &&
//     !(await checkDietaryCompliance(product.ingredients_text, userPrefs))
//   ) {
//     const alternatives = await findAlternatives(product.category, userPrefs);
//     console.log("Recommended Alternatives:", alternatives);
//   }
// };
