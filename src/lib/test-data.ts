// This file tests that the data import works correctly
import shiftsData from '../../data.json';

console.log('Shifts data loaded:', {
  dataType: typeof shiftsData,
  isArray: Array.isArray(shiftsData),
  length: Array.isArray(shiftsData) ? shiftsData.length : 0,
  sampleItem: Array.isArray(shiftsData) && shiftsData.length > 0 ? shiftsData[0] : null
});

export const testData = {
  shiftsCount: Array.isArray(shiftsData) ? shiftsData.length : 0,
  hasData: Array.isArray(shiftsData) && shiftsData.length > 0
};

// Export the data for testing
export default shiftsData; 