import React, {useEffect, useState, useRef} from "react"
import SimpleTable from '../../IpaControls/SimpleTable'
import moment from 'moment'

const HaystackPointReadingTable = ({points, decimalPlaces, columnNames, firstOfGroup = true, showEntityName = false, tableClasses, entityNameClasses}) => {

  const [pointInfos, setPointInfos] = useState([])
  const [lastRefresh, setLastRefresh] = useState(moment())
  const [lastRefreshText, setLastRefreshText] = useState("Refreshed less than a minute ago")
  const [myInterval, setMyInterval] = useState(null)
  const myIntervalRef = useRef() //we need a ref to the interval so we can clear it on unmount
  const lastRefreshRef = useRef() //we need a ref for the interval, otherwise it always used the initial value

  const getPointReadingDisplay = (point) => {
    
    if (!point.hasOwnProperty('curVal'))
      return ""
    else if (point.kind === "Str")
      return point.curVal
    else if (point.kind === "Number")
      return point.curVal.toFixed(decimalPlaces || 3) + " " + point.unit
      else if (point.kind === "Bool"){
        if (point.enum) {
          let enums = point.enum.split(',')
          return point.curVal ? enums[1] : enums[0]
        }
        else
          return point.curVal.toString()
      }
  
  }
  
  const getPointReadingStatusDisplay = (point) => {
    
    if (!point.curErr && point.curStatus == "ok")
      return <span>
        <i className="fas fa-circle point-icon point-ok"></i>
        {point.curStatus}
      </span>
    else if (!point.curErr && point.curStatus !== "ok")
      return <span>
        <i className="fas fa-exclamation-triangle point-icon point-warn"></i>
        {point.curStatus}
      </span>
    else {
      return <span>
        <i className="fas fa-exclamation-circle point-icon point-error"></i>
        {point.curStatus + " - " + point.curErr}
      </span>
    }
  }
  
  const getElapsedTime = () => {
    
    let diff = moment().diff(lastRefreshRef.current, 'minutes')
    let minutes
    if (diff === 0)
      minutes = "less than a minute ago"
    else if (diff === 1)
      minutes = diff + " minute ago"
    else
      minutes = diff + " minutes ago"
    
    setLastRefreshText("Refreshed " + minutes)
  }
  
  const columns = [
    {name: columnNames && columnNames.name ? columnNames.name : "Name", accessor: "name"},
    {name: columnNames && columnNames.readings ? columnNames.readings : "Reading", accessor: "reading"},
    {name: columnNames && columnNames.status ? columnNames.status : "Status", accessor: "status"}
  ]
  
  const classes = "fixed-header simple-property-grid";
  let hayStackTableClasses = "haystack-point-reading-table";
  hayStackTableClasses += tableClasses ? ' ' + tableClasses : '';
  
  useEffect(() => {

    setMyInterval(setInterval(() => {
      getElapsedTime()
    }, 60000))
    
    //clear any active interval on unmount
    return () => {
      if (myIntervalRef.current) clearInterval(myIntervalRef.current)
    }
  }, [])
  
  useEffect(() => {
    
    if (points && points.length) {
      let newPointInfos = points.map((point) => {
        return {
          name: point.navName,
          status: getPointReadingStatusDisplay(point),
          reading: getPointReadingDisplay(point)
        }
      })
      
      newPointInfos.sort((a,b) => {
          return a.name.localeCompare(b.name)
      })

      setPointInfos(newPointInfos)
      setLastRefresh(moment())
    }
    else setPointInfos([])
    
  }, [points])
  
  useEffect(() => {
    lastRefreshRef.current = lastRefresh
    getElapsedTime()
  }, [lastRefresh])
  
  useEffect(() => {
    //we need a ref to the interval so we can clear it on unmount
    myIntervalRef.current = myInterval
  }, [myInterval])
 
  return (<div className={hayStackTableClasses}>
      {firstOfGroup && <div className="refresh-notice"><i className="far fa-clock"></i><span className="refresh-notice-text">{lastRefreshText}</span></div>}
      {showEntityName && <div className={entityNameClasses}>{points[0].id.display}</div>}
      <SimpleTable objects={pointInfos} columns={columns} className={classes} showHeader={firstOfGroup}/>
    </div>
  )

}

export const HaystackPointReadingTableFactory = {
  create: ({config, data}) => {
  
    return <HaystackPointReadingTable {...config.config} {...data}/>
    
  }
}

export default HaystackPointReadingTable
