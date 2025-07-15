import { View, Text, TextInput ,Button} from 'react-native'
import React, { useState } from 'react'

const SignUp = () => {
    const [name,setName]=useState('');
    const [email, setEmail]=useState('');
    const [pw,setPw]=useState('');
    const [done,setDone]=useState(false);
    const OnSubmit=async ()=>{
        try{
            const response = await fetch("http://192.168.1.6:3000/signup",{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: pw
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data= await response.json();
            setDone(true);
            console.log("Sign Up succesfull: ",data);
        }
        catch(err){
            console.log("Error: ",err);
        }
    }
  return (
    <View>
        <TextInput
            value={name}
            onChangeText={setName}
            placeholder='enter a user name'
        />
        <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder='enter email'
        />
        <TextInput
            value={pw}
            onChangeText={setPw}
            placeholder='choose a password'
        />
        <Button title='SignUp' onPress={OnSubmit}/>
        {done ? <Text>User Created</Text> : null}
    </View>
  )
}

export default SignUp