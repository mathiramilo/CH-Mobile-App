import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'

import { storage } from '../../../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import { useDispatch, useSelector } from 'react-redux'

import { DismissKeyboardView, Input, NavigationHeader } from '../../../components/common'

import theme from '../../../theme'
import { styles } from './styles'

const uploadImage = async uri => {
  const storageRef = ref(storage, `users/avatars/${uri.split('/').pop()}`)

  const response = await fetch(uri)
  const blob = await response.blob()

  await uploadBytes(storageRef, blob)

  const downloadUrl = await getDownloadURL(storageRef)

  return downloadUrl
}

const ManageInformationScreen = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const [formState, setFormState] = useState({
    fullName: user.fullName,
    phone: user.phone
  })
  const [formError, setFormError] = useState('')

  const [pickedUrl, setPickedUrl] = useState(null)

  const verifyCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to use the camera', [{ text: 'OK' }], {
        userInterfaceStyle: 'light'
      })
      return false
    }
    return true
  }

  const verifyLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to access the image galery', [{ text: 'OK' }], {
        userInterfaceStyle: 'light'
      })
      return false
    }
    return true
  }

  const handleSelectFromLibrary = async () => {
    const hasPermission = await verifyLibraryPermissions()

    if (!hasPermission) return

    const image = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })

    if (!image.canceled) setPickedUrl(image.assets[0].uri)
  }

  const handleTakeImage = async () => {
    const hasPermission = await verifyCameraPermissions()

    if (!hasPermission) return

    const image = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })

    if (!image.canceled) setPickedUrl(image.assets[0].uri)
  }

  const handleSaveInformation = async () => {
    if (formState.fullName === '' || formState.phone === '') {
      setFormError('All fields are required')
      return
    }

    if (formState.phone.length < 9) {
      setFormError('Phone number is invalid')
      return
    }

    if (pickedUrl) {
      const downloadUrl = await uploadImage(pickedUrl)
      // Update user info
    }
  }

  return (
    <DismissKeyboardView style={styles.container}>
      <NavigationHeader text="Manage Information" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarItem}>
          <Text style={styles.itemTitle}>Avatar</Text>
          <View style={styles.itemContent}>
            <Image
              style={styles.previewImg}
              resizeMode="contain"
              source={{ uri: pickedUrl ? pickedUrl : user.imgUrl }}
            />
            <View style={styles.changeImgOptions}>
              <TouchableOpacity onPress={handleSelectFromLibrary}>
                <View style={styles.changeImgOption}>
                  <MaterialIcons name="image" size={16} color={theme.colors.black} />
                  <Text style={styles.changeImgText}>Select from your photos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleTakeImage}>
                <View style={styles.changeImgOption}>
                  <MaterialIcons name="camera-alt" size={16} color={theme.colors.black} />
                  <Text style={styles.changeImgText}>Take a picture</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.item}>
          <Input
            label="Full Name"
            value={formState.fullName}
            onChangeText={text => setFormState(prev => ({ ...prev, fullName: text }))}
            placeholder="Enter your fullname"
            placeholderTextColor={theme.colors.black}
            autoCapitalize="words"
            autoComplete="name"
            autoCorrect={false}
          />
          <MaterialIcons name="person-outline" size={24} color={theme.colors.black} />
        </View>

        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemLeftLabel}>Email</Text>
            <Text style={styles.itemLeftText}>{user.email}</Text>
          </View>
          <MaterialCommunityIcons name="email-outline" size={24} color={theme.colors.gray} />
        </View>

        <View style={styles.item}>
          <Input
            label="Phone"
            value={formState.phone}
            onChangeText={text => setFormState(prev => ({ ...prev, phone: text }))}
            placeholder="Enter your phone number"
            placeholderTextColor={theme.colors.black}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect={false}
          />
          <MaterialIcons name="phone-iphone" size={24} color={theme.colors.black} />
        </View>

        <View style={styles.separatorBar}></View>

        <TouchableOpacity onPress={handleSaveInformation}>
          <View style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </DismissKeyboardView>
  )
}

export default ManageInformationScreen
