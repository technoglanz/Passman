import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Papa from 'papaparse';
import { Alert } from 'react-native';

export const selectAndParseCSV = async () => {
  try {
    // Open the file picker
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });

    // Ensure a file was selected
    if (!res || res.length === 0) {
      Alert.alert('No File Selected', 'Please select a CSV file.');
      return null; // Exit early if no file is selected
    }

    const { uri } = res[0];

    // Check if the URI exists
    if (!uri) {
      Alert.alert('Error', 'No valid file selected.');
      return null; // Exit early if no valid URI
    }

    // Read file content
    const fileContent = await RNFS.readFile(uri, 'utf8');

    // Parse the CSV file
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          resolve(result.data); // Resolve parsed data
        },
        error: (err) => {
          reject(err); // Reject in case of parsing errors
        },
      });
    });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // Handle user canceling the picker
      Alert.alert('No File Selected', 'You canceled the file picker.');
    } else {
      // Handle other errors
      console.error('Error selecting file:', err);
      Alert.alert('Error', 'An error occurred while selecting a file.');
    }
    return null; // Return null to indicate no data
  }
};
