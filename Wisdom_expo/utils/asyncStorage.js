import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeDataLocally = async (key, value) => {
    try{
      await AsyncStorage.setItem(key, value); 
      console.log('data saved', key)
    }catch(error){
      console.log(`Saving data error: ${error}`)
    }
};

export const getDataLocally = async (key)=>{
    try{
        const value = await AsyncStorage.getItem(key);
        console.log('data loaded', key);
        return value;
    } catch (error){
      console.log(`Getting data error: ${error}`)
    }
};
