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
  InteractionManager,
} from "react-native";

const iconDictionary = {
    'default': require('../item_icons/default.png'),

    'avocados': require('../item_icons/Avocado.png'),
    'avocado': require('../item_icons/Avocado.png'),

    'bananas': require('../item_icons/Banana.png'),
    'banana': require('../item_icons/Banana.png'),

    'bellpeppers': require('../item_icons/Bell_Pepper.png'),
    'bellpepper': require('../item_icons/Bell_Pepper.png'),

    'broccoli': require('../item_icons/Broccoli.png'),

    'carrots': require('../item_icons/Carrot.png'),
    'carrot': require('../item_icons/Carrot.png'),

    'cherries': require('../item_icons/Cherry.png'),
    'cherry': require('../item_icons/Cherry.png'),

    'garlic': require('../item_icons/Garlic.png'),

    'grapes': require('../item_icons/Grape.png'),
    'grape': require('../item_icons/Grape.png'),

    'greenonion': require('../item_icons/Green_Onion.png'),
    'greenonions': require('../item_icons/Green_Onion.png'),

    'lemons': require('../item_icons/Lemon.png'),
    'lemon': require('../item_icons/Lemon.png'),

    'lettuce': require('../item_icons/Lettuce.png'),

    'limes': require('../item_icons/Lime.png'),
    'lime': require('../item_icons/Lime.png'),

    'mushrooms': require('../item_icons/Mushroom.png'),
    'mushroom': require('../item_icons/Mushroom.png'),

    'onions': require('../item_icons/Onion.png'),
    'onion': require('../item_icons/Onion.png'),

    'oranges': require('../item_icons/Orange.png'),
    'orange': require('../item_icons/Orange.png'),

    'pears': require('../item_icons/Pear.png'),
    'pear': require('../item_icons/Pear.png'),

    'potatoes': require('../item_icons/Potato.png'),
    'potato': require('../item_icons/Potato.png'),

    'radishes': require('../item_icons/Radish.png'),
    'radish': require('../item_icons/Radish.png'),

    'strawberries': require('../item_icons/Strawberry.png'),
    'strawberry': require('../item_icons/Strawberry.png'),

    'tomatoes': require('../item_icons/Tomato.png'),
    'tomato': require('../item_icons/Tomato.png'),

    'watermelons': require('../item_icons/Watermelon.png'),
    'watermelon': require('../item_icons/Watermelon.png'),


};

export const icon_search = (addedItem) => {
  if(!addedItem){
    return iconDictionary ['default'];
  }

  const lowercaseItemName = addedItem.toLowerCase();

  const stripItemName = lowercaseItemName.replace(/\s+/g,'');

  if (iconDictionary[stripItemName]){
    return iconDictionary[stripItemName];
  }

  const icon_names = Object.keys(iconDictionary);

  for (let icon_name in icon_names){

    if (stripItemName.includes(icon_names[icon_name])){
      return iconDictionary[icon_names[icon_name]];
    }
  }

  return iconDictionary['default'];


}