import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Motion } from "@legendapp/motion";
import { Check, Plus, Trash2 } from "lucide-react-native";

// Adjust the path to where your asset actually lives
const TEMPLATE = require("../assets/SP_grocerylist2.png");

export default function GroceryList() {
  //basic state
  const [brand] = useState({ name: "Grocery List", no: 1367 });
  const [taxRate, setTaxRate] = useState(0.05);
  const [taxInclusive, setTaxInclusive] = useState(true);

  // simple ID generator 
  const makeId = () =>
    Date.now().toString() + Math.random().toString(36).substring(2, 9);

  const [items, setItems] = useState([
    { id: makeId(), name: "Old Fashioned", qty: 1, price: 100, done: false },
  ]);

  const now = useMemo(() => new Date(), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.qty * (it.price || 0), 0);
    const tax = taxInclusive
      ? Math.round(subtotal - subtotal / (1 + taxRate))
      : Math.round(subtotal * taxRate);
    const grand = taxInclusive ? subtotal : subtotal + tax;
    return { subtotal, tax, grand };
  }, [items, taxRate, taxInclusive]);

  // actions
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: makeId(), name: "", qty: 1, price: 0, done: false },
    ]);

  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  // User interface starts here
  return (
    <View style={styles.screen}>

      {/* Receipt container with the template as background */}
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Motion.View
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.receiptShadow}
        >
          {/* Keep a fixed aspect ratio similar to the image (3:5) */}
          <View style={styles.aspectBox}>
            {/* Background receipt image */}
            <Image
                source={TEMPLATE}
                resizeMode="contain"
                style={[
                    StyleSheet.absoluteFillObject,
                    {
                    width: "115%", //changing the size of the image
                    height: "115%",
                    alignSelf: "contain",
                    transform: [{ translateX: -25 }, { translateY: -33 }], //moving the recipt image left and right
                    },
                ]}
            />


            {/* Overlay content positioned by percentage to match template */}
            <View style={StyleSheet.absoluteFill}>
              {/* Header */}
              <View
                style={[
                  styles.overlayBlock,
                  { top: "11%", left: "12%", right: "12%" },    //text box sizeing 
                ]}
              >
                <Text style={styles.headerTitle}>{brand.name}</Text>
                <Text style={styles.headerSub}>No. {brand.no}</Text>
                <Text style={styles.headerSub}>
                  {now.toLocaleDateString()} ·{" "}
                  {now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              {/* Items */}
              <View
                style={[
                  styles.overlayBlock,
                  { top: "28%", left: "10%", right: "10%" },
                ]}
              >
                {items.map((it) => (
                  <View key={it.id} style={styles.row}>
                    {/* checkbox */}
                    <Pressable
                      onPress={() => updateItem(it.id, { done: !it.done })}
                      style={[
                        styles.checkbox,
                        it.done && { backgroundColor: "#12243a" },
                      ]}
                    >
                      {it.done && <Check size={12} color="#fff" />}
                    </Pressable>

                    {/* name */}
                    <TextInput
                      value={it.name}
                      onChangeText={(v) => updateItem(it.id, { name: v })}
                      placeholder="Item name"
                      placeholderTextColor="#6a7a8a"
                      style={[styles.input, { flex: 1 }]}
                    />

                    {/* qty */}
                    <TextInput
                      keyboardType="number-pad"
                      value={String(it.qty)}
                      onChangeText={(v) =>
                        updateItem(it.id, { qty: Number(v || 0) })
                      }
                      style={[styles.input, { width: 40, textAlign: "right" }]}
                    />

                    {/* price */}
                    <View
                      style={{
                        width: 70,
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.inkFaint}>$</Text>
                      <TextInput
                        keyboardType="number-pad"
                        value={String(it.price)}
                        onChangeText={(v) =>
                          updateItem(it.id, { price: Number(v || 0) })
                        }
                        style={[styles.input, { width: 60, textAlign: "right" }]}
                      />
                    </View>

                    {/* remove */}
                    <Pressable
                      onPress={() => removeItem(it.id)}
                      hitSlop={6}
                      style={{ paddingLeft: 4 }}
                    >
                      <Trash2 size={16} color="#12243a" />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* Totals */}
              <View
                style={[
                  styles.overlayBlock,
                { left: "12%", right: "12%", bottom: "16%" },
                ]}
              >
                <View style={[styles.row, { marginBottom: 6 }]}>
                  <Text style={styles.inkFaint}>Tax</Text>
                  <View style={{ flex: 1 }} />
                  <TextInput
                    keyboardType="decimal-pad"
                    value={String(taxRate)}
                    onChangeText={(v) => setTaxRate(Number(v || 0))}
                    style={[
                      styles.input,
                      {
                        width: 70,
                        textAlign: "right",
                        borderBottomWidth: 1,
                        borderStyle: "dotted",
                      },
                    ]}
                  />
                  <Text style={[styles.inkFaint, { marginLeft: 8 }]}>
                    {taxInclusive ? "incl." : "excl."}
                  </Text>
                  <Pressable onPress={() => setTaxInclusive((t) => !t)}>
                    <Text style={[styles.link]}>toggle</Text>
                  </Pressable>
                </View>

                <View style={{ gap: 2 }}>
                  <View style={styles.totalsLine}>
                    <Text style={styles.inkFaint}>Subtotal</Text>
                    <Text style={styles.ink}>
                      $ {totals.subtotal.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.totalsLine}>
                    <Text style={styles.inkFaint}>(Tax)</Text>
                    <Text style={styles.ink}>
                      $ {totals.tax.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.totalsLine, { marginTop: 2 }]}>
                    <Text style={[styles.ink, { fontWeight: "700" }]}>Total</Text>
                    <Text style={[styles.ink, { fontWeight: "700" }]}>
                      $ {totals.grand.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer thanks */}
              <View
                style={[
                  styles.overlayBlock,
                  { left: "15%", right: "15%", bottom: "9%" },
                ]}
              >
                <Text
                  style={[
                    styles.inkFaint,
                    { textAlign: "center", fontSize: 10 },
                  ]}
                >
                  Thank You!
                </Text>
              </View>
            </View>
          </View>
        </Motion.View>
      </ScrollView>
      <Pressable style={styles.fab} onPress={addItem}>
        <Plus size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: '#12243a',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  screen: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    padding: 16,
  },
  toolbar: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolbarTitle: { fontWeight: "700", color: "#1f2937" },
  toolbarSub: { fontSize: 12, color: "rgba(31,41,55,0.7)" },
  primaryBtn: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    elevation: 1,
  },
  primaryBtnText: { fontSize: 14, color: "#111827" },
  receiptShadow: {
    width: "100%",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: "hidden",
  },
  aspectBox: {
    width: "90%",        
    aspectRatio: .58,  
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20, 
  },
  overlayBlock: {
    position: "absolute",
  },
  headerTitle: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 14,
    color: "#12243a",
  },
  headerSub: {
    textAlign: "center",
    fontSize: 10,
    color: "rgba(18,36,58,0.7)",
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#12243a",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    fontSize: 12,
    color: "#12243a",
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  ink: { color: "#12243a", fontSize: 12 },
  inkFaint: { color: "rgba(18,36,58,0.7)", fontSize: 12 },
  link: { color: "#1d4ed8", fontSize: 10, marginLeft: 8 },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  receiptShadow: {
  width: "100%",
  borderRadius: 20,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
  backgroundColor: "#f9f9f9",
  alignItems: "center",
  justifyContent: "center",
},

});



