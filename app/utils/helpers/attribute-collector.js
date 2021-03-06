export default function helpersAttributeValueCollector(searchObject, attributeName, isEmberRecord, nestedSearchObjectNames) {

  if(searchObject === undefined || attributeName === undefined || isEmberRecord === undefined) {
    throw new Error("no arguments");
  }

  let arrOfValues = []; 

  const attributeValue = isEmberRecord ? searchObject.get(attributeName) : searchObject[attributeName];  

  if(attributeValue) {
    arrOfValues.push(attributeValue);
  }

  if(Array.isArray(nestedSearchObjectNames)) {

    nestedSearchObjectNames.forEach((nestedElementName) => {
      const possibleNestedElementsArr = isEmberRecord ? searchObject.get(nestedElementName) : searchObject[nestedElementName];

      if(possibleNestedElementsArr && Array.isArray(possibleNestedElementsArr)) {

        possibleNestedElementsArr.forEach((nestedElement) => {
          arrOfValues = arrOfValues.concat(helpersAttributeValueCollector(nestedElement, attributeName, isEmberRecord, nestedSearchObjectNames));
        });

      }

    });
  }

  return arrOfValues;
}
