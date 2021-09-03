import { toNormalString } from "../string";


export function getAllObjectKeys(objects) {
    return objects.reduce((a, b) => {
        for(let key of Object.keys(b))  {
            if(!a.includes(key))    {
                a.push(key);
            }
        }
        return a;
    }, []);
}

export function sortObjectsByDate(arr)  {
    arr.sort((a, b) => {
        let date1 = new Date(a.releasedDate).getTime(),
            date2 = new Date(a.releasedDate).getTime();
        return date1 < date2 ? -1 : date1 > date2 ? 1 : 0; 
    })
}


export function objectToString(object, delimiter=", ") {
    let output = [];
    for(let key in object)  {
        output.push(`${toNormalString(key)} : ${toNormalString(object[key]).toUpperCase()}`);
    }
    return output.join(delimiter);
}

export function isObjectUnique(obj, objectsArray, keys=[])   {   
    let overAllResults = []; 
    for(let object of objectsArray)  {
        let results = [];
        if(keys.length) {
            for(let key of keys)    {
                results.push(obj[key] !== object[key]);
            }
        } else  {
            for(let key in obj) {
                results.push(obj[key] !== object[key]);
            }
        }
        
        overAllResults.push(results.every(res => res));
    }
    return overAllResults.every(res => res);
}

export function filterUnlistedObjects(localObjects, allObjects, keys=[])    {
    return allObjects.filter(obj => isObjectUnique(obj, localObjects, keys));
}

export function isObjectInArray(object, array = []) {
    return array.some(item => {
        let results = [];
        for(let key in object)    {
            results.push(object[key] === item[key]);
        }
        return results.every(res => res);
    });
}

export function sortArrayByObjectProp(arr, prop, asc = true)   {
    return arr.sort((a, b) => {
        if(!isNaN(Number(a[prop]))) {
            return asc ? Number(a[prop]) - Number(b[prop]) : Number(b[prop]) - Number(a[prop]);
        } else  {
            if(asc) {
                return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0; 
            } else  {
                return a[prop] < b[prop] ? 1 : a[prop] > b[prop] ? -1 : 0;
            }
            
        }
    });
}

export function getNestedObjectsArray({dataArray, relationalProp, uniqueProp, sortByProp = null, ascSortOrder = true})  {
    
    if(!dataArray.length)   {
        return;
    }

    sortByProp = sortByProp ? sortByProp : Object.keys(dataArray[0]).includes("id") ? "id" : Object.keys(dataArray[0])[0];

    let sortedArray = [];
    dataArray.forEach(item => item.children = []);


    function recursiveNesting(dataArray, relationalProp, uniqueProp) {
        let parentArray = [],
            childrenArray = [];

        dataArray.forEach(data => {
            let children = dataArray.filter(item => data[uniqueProp] === item[relationalProp]),
                parent = dataArray.find(item => data[relationalProp] === item[uniqueProp]);    
            if(!children.length)    {
                if(!parent) {
                    sortedArray.push(data);
                } else  {
                    childrenArray.push(data);
                }
            } else{
                parentArray.push(data);
            }
        });

        parentArray = parentArray.map(parent => {
            parent.children.push(...childrenArray.filter(child => child[relationalProp] === parent[uniqueProp]));
            parent.children = sortArrayByObjectProp(parent.children, sortByProp, ascSortOrder);
            return parent;
        });

        sortArrayByObjectProp(parentArray, sortByProp, ascSortOrder);

        if(parentArray.length)  {
            recursiveNesting(parentArray, relationalProp, uniqueProp, sortByProp, ascSortOrder);
        }   
    }
    

    recursiveNesting(dataArray, relationalProp, uniqueProp);

    return sortArrayByObjectProp(sortedArray, sortByProp, ascSortOrder);
    
}