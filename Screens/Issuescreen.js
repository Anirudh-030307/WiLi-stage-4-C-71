import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from '../config';
import firebase from 'firebase';

export default class Issuescreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      Scanned: false,
      ButtonState: 'normal',
      BookID: '',
      StudentID: '',
    }
  }
  GetCameraPermissions = async (x) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status === "granted",
      ButtonState: x,
      Scanned: false,
    })
  }
  HandleBarCodeScanner = async ({ type, data }) => {
    if (this.state.ButtonState === 'BookID') {
      this.setState({
        Scanned: true,
        BookID: data,
        ButtonState: 'normal',
      })
    } else if (this.state.ButtonState === 'StudentID') {
      this.setState({
        Scanned: true,
        StudentID: data,
        ButtonState: 'normal',
      })
    }

  }
  HandleTransactions = () => {
    db.collection('Books').doc(this.state.BookID).get().then(
      (doc) => {
        var details = doc.data()
        if (details.BookAvailability === true) {
          this.initiateBookIssue()
        } else {
          this.initiateBookReturn()
        }
      }
    )
  }
  initiateBookIssue = () => {
    db.collection('Transactions').add({
      StudentID: this.state.StudentID,
      BookID: this.state.BookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      TransactionType:'issue',
    })
    db.collection('Books').doc(this.state.BookID).update({
      BookAvailability:false,
    })
    db.collection('Students').doc(this.state.StudentID).update({
      NumberofBooksIssued:firebase.firestore.FieldValue.increment(1)
    })
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const Scanned = this.state.Scanned;
    const ButtonState = this.state.ButtonState;
    if (ButtonState !== "normal" && hasCameraPermissions === true) {
      return (
        <BarCodeScanner onBarCodeScanned={Scanned ? undefined : this.HandleBarCodeScanner} />
      )
    } else {
      return (
        <View style={styles.Container} >
          <Image style={styles.ImageStyle} source={require("../assets/booklogo.jpg")} />
          <View style={styles.view} >
            <TextInput style={styles.TextBox} value={this.state.BookID} onChangeText={(Text) => (this.setState({
              BookID: Text
            }))} placeholder="BookID" />
            <TouchableOpacity style={styles.ScanButton} onPress={() => this.GetCameraPermissions('BookID')}> <Text style={styles.text} >SCAN</Text></TouchableOpacity>
          </View>
          <View style={styles.view} >
            <TextInput style={styles.TextBox} value={this.state.StudentID} onChangeText={(Text) => (this.setState({
              StudentID: Text
            }))} placeholder="StudentID" />
            <TouchableOpacity style={styles.ScanButton} onPress={() => this.GetCameraPermissions('StudentID')}> <Text style={styles.text} >SCAN</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.SumbitButton} onPress={this.HandleTransactions}><Text style={styles.text} >SUMBIT</Text></TouchableOpacity>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  Container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ImageStyle: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  ScanButton: {
    alignSelf: 'center',
    borderWidth: 1,
    backgroundColor: 'lightgreen',
    width: 60,
    height: 40,
  },
  text: {
    alignSelf: 'center',
    marginTop: 10,
  },
  SumbitButton: {
    alignSelf: 'center',
    marginTop: 50,
    borderWidth: 1,
    borderRadius: 10,
    width: 90,
    height: 40,
  },
  TextBox: {
    alignSelf: 'center',
    borderWidth: 1,
    width: 200,
    height: 50,
  },
  view: {
    flexDirection: 'row'
  },
})