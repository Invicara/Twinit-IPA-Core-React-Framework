import React, {useEffect, useState} from "react";
import HaystackPointReadingTable from "./HaystackPointReadingTable";
import ScriptHelper from "../../IpaUtils/ScriptHelper";

const HaystackPointReadingTableGroup = ({equipment, decimalPlaces, columnNames, refreshInterval, script, extendedData}) => {
 
  const [equipmentData, setEquipmentData] = useState([])

  useEffect(() => {
    const loadData = async () => {
      if(extendedData){        
      var groupedPoints = _(extendedData.points)
            .groupBy(x => x.equipRef.display)
            .map((value, key) => ({points: value}))
            .value();
            
        setEquipmentData(groupedPoints)
      }else{
        let newEquipmentData = await Promise.all(equipment.map(async (e) => {
          return await ScriptHelper.executeScript(script, {equipment: e});          
        }));
        
        setEquipmentData([...newEquipmentData, ...equipmentData]);
      }      
   }    

   loadData();

   if(!extendedData){
    const refreshData = setInterval(() => {
      loadData();
    }, refreshInterval*60000);
    return () => clearInterval(refreshData);
   } 

  }, [script, extendedData])

  return (<div className="haystack-point-reading-table-group">
    {equipmentData.length === 0 && <div>Loading...</div>}
    {equipmentData.length !== 0 && 
      equipmentData.map((e, index) =>
        <HaystackPointReadingTable key={e.points[0].id.display} decimalPlaces={decimalPlaces} columnNames={columnNames} points={e.points} firstOfGroup={index===0} showEntityName={true} entityNameClasses={'simple-table-group-name'} tableClasses={'simple-table-group'}/>
      )}
  </div>)

}

export const HaystackPointReadingTableGroupFactory = {
  create: ({config, data}) => {
  
    return <HaystackPointReadingTableGroup {...config.config} extendedData={data}/>
    
  }
}

export default HaystackPointReadingTableGroup
