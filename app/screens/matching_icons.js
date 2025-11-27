import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  TextInput,
  Alert,
  FlatList,
  Platform,
  Modal,
} from "react-native";

const allIcons = {
    'default': require('./app/item_icons/default.png'),

    'avocados': require('./app/item_icons/Avocado.png'),
    'avocado': require('./app/item_icons/Avocado.png'),

    'bananas': require('./app/item_icons/Banana.png'),
    'banana': require('./app/item_icons/Banana.png'),

    'bellpeppers': require('./app/item_icons/Bell_Pepper.png'),
    'bellpepper': require('./app/item_icons/Bell_Pepper.png'),

    'broccoli': require('./app/item_icons/Broccoli.png'),

    'carrots': require('./app/item_icons/Carrot.png'),
    'carrot': require('./app/item_icons/Carrot.png'),

    'cherries': require('./app/item_icons/Cherry.png'),
    'cherry': require('./app/item_icons/Cherry.png'),

    'garlic': require('./app/item_icons/Garlic.png'),

    'grapes': require('./app/item_icons/Grape.png'),
    'grape': require('./app/item_icons/Grape.png'),

    'greenonion': require('./app/item_icons/Green_Onion.png'),

    'lemons': require('./app/item_icons/Lemon.png'),
    'lemon': require('./app/item_icons/Lemon.png'),

    'lettuce': require('./app/item_icons/Lettuce.png'),

    'limes': require('./app/item_icons/Lime.png'),
    'lime': require('./app/item_icons/Lime.png'),

    'mushrooms': require('./app/item_icons/Mushroom.png'),
    'mushroom': require('./app/item_icons/Mushroom.png'),

    'onions': require('./app/item_icons/Onion.png'),
    'onion': require('./app/item_icons/Onion.png'),

    'oranges': require('./app/item_icons/Orange.png'),
    'orange': require('./app/item_icons/Orange.png'),

    'pears': require('./app/item_icons/Pear.png'),
    'pear': require('./app/item_icons/Pear.png'),

    'potatoes': require('./app/item_icons/Potato.png'),
    'potato': require('./app/item_icons/Potato.png'),

    'radishes': require('./app/item_icons/Radish.png'),
    'radish': require('./app/item_icons/Radish.png'),

    'strawberries': require('./app/item_icons/Strawberry.png'),
    'strawberry': require('./app/item_icons/Strawberry.png'),

    'tomatoes': require('./app/item_icons/Tomato.png'),
    'tomato': require('./app/item_icons/Tomato.png'),

    'watermelons': require('./app/item_icons/Watermelon.png'),
    'watermelon': require('./app/item_icons/Watermelon.png'),

};