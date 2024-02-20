
const MonthsURL = 'months'
const ProjectsURL = 'projects'
const RegionsURL = `${ProjectsURL}/regions`
const HoursURL = 'hours'
const UsersURL = 'users'
const ReportersURL = 'reporters'
const TeamsURL = 'teams'
const MyTeamURL = 'myteam'

const getOMAPIRoot = () => {

   let currentProject = JSON.parse(sessionStorage.getItem('project'))
   return `${endPointConfig.itemServiceOrigin}/omapi/${currentProject._namespaces[0]}`
}

const twinitUtils = {

   getLatestMonths: async (months=3) => {

      let OMAPIRoot = getOMAPIRoot()
      let url = `${OMAPIRoot}/${MonthsURL}?latest=${months}`

      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let fetchedMonthsResp = await fetch(url, {
         method: 'GET',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         }
      })

      if (fetchedMonthsResp.ok) {
         let  json = await fetchedMonthsResp.json()
         return json._result
      } else {
         throw('Error fetching months!')
      }

   },

   getProjects: async () => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let pageSize = 200
      let offset = 0
      let total = 20000

      let projects = []
      
      while (projects.length < total) {

         let url = `${OMAPIRoot}/${ProjectsURL}?_offset=${offset}&_pageSize=${pageSize}`

         let fetchedProjectsResp = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         })
   
         if (fetchedProjectsResp.ok) {
            let  json = await fetchedProjectsResp.json()
            total = json._result._total
            projects.push(...json._result._list)
            offset += pageSize
         } else {
            throw('Error fetching projects!')
         }
      }

      return projects

   },

   getProjectNames: async () => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let pageSize = 200
      let offset = 0
      let total = 20000

      let cusProjects = []
      let intProjects = []
      
      while (cusProjects.length + intProjects.length < total) {

         let url = `${OMAPIRoot}/${ProjectsURL}?_offset=${offset}&_pageSize=${pageSize}`

         let fetchedProjectsResp = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         })
   
         if (fetchedProjectsResp.ok) {
            let  json = await fetchedProjectsResp.json()
            total = json._result._total
            offset += pageSize
            
            json._result._list.forEach((p) => {
               if (p.region !== 'None')
                  cusProjects.push(p.name)
               else
                  intProjects.push(p.name)
            })
            
         } else {
            throw('Error fetching projects!')
         }
      }

      return {
         cusProjects,
         intProjects
      }
   },

   getProjectsByName: async (names) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let pageSize = 200
      let offset = 0
      let total = 20000

      let projects = []
      
      while (projects.length < total) {

         let url = `${OMAPIRoot}/${ProjectsURL}?_offset=${offset}&_pageSize=${pageSize}&projectNames=${encodeURIComponent(names.join(','))}`

         let fetchedProjectsResp = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         })
   
         if (fetchedProjectsResp.ok) {
            let  json = await fetchedProjectsResp.json()
            total = json._result._total
            projects.push(...json._result._list)
            offset += pageSize
         } else {
            throw('Error fetching projects!')
         }
      }

      return projects

   },

   createProject: async (name, region) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${ProjectsURL}`

      let createProjectResp = await fetch(url, {
         method: 'POST',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({project: {name, region}})
      })

      if (createProjectResp.ok) {
         let  json = await createProjectResp.json()
         return json
      } else {
         throw('Error creating project!')
      }

   },

   updateProject: async (project) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${ProjectsURL}`

      let updateProjectResp = await fetch(url, {
         method: 'PUT',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({project})
      })

      if (updateProjectResp.ok) {
         let  json = await updateProjectResp.json()
         return json
      } else {
         throw('Error creating project!')
      }

   },

   getAllRegions: async () => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${RegionsURL}`

      let getRegionsResp = await fetch(url, {
         method: 'GET',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         }
      })

      if (getRegionsResp.ok) {
         let  json = await getRegionsResp.json()
         return json._result
      } else {
         throw('Error creating project!')
      }

   },

   saveNewHourItems: async (hourItems) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${HoursURL}`

      let createHoursResp = await fetch(url, {
         method: 'POST',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({hourItems})
      })

      if (createHoursResp.ok) {
         let  json = await createHoursResp.json()
         return json
      } else {
         throw('Error saving new hours!')
      }

   },

   updateHourItems: async (hourItems) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${HoursURL}`

      let updateHoursResp = await fetch(url, {
         method: 'PUT',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({hourItems})
      })

      if (updateHoursResp.ok) {
         let  json = await updateHoursResp.json()
         return json._result
      } else {
         throw('Error saving new hours!')
      }

   },

   getExistingHoursForMonth: async (forWho, month, week) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let pageSize = 200
      let offset = 0
      let total = 20000

      let hours = []
      
      while (hours.length < total) {

         let url = `${OMAPIRoot}/${HoursURL}?_offset=${offset}&_pageSize=${pageSize}&month=${month}`
         if (week) url = url + `&weekStart=${week.start}`
         if (forWho) url = url + `&forWho=${forWho}`

         let fetchedHoursResp = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         })
   
         if (fetchedHoursResp.ok) {
            let  json = await fetchedHoursResp.json()
            total = json._result._total
            hours.push(...json._result)
            offset += pageSize
         } else {
            throw('Error fetching hours!')
         }
      }

      return hours
   },

   getHourReporterUsers: async () => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let pageSize = 200
      let offset = 0
      let total = 20000

      let users = []
      
      while (users.length < total) {

         let url = `${OMAPIRoot}/${UsersURL}/${ReportersURL}?_offset=${offset}&_pageSize=${pageSize}`

         let fetchedReportersResp = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            }
         })
   
         if (fetchedReportersResp.ok) {
            let  json = await fetchedReportersResp.json()
            total = json._result._total
            users.push(...json._result._list)
            offset += pageSize
         } else {
            throw('Error fetching projects!')
         }
      }

      return users

   },

   getUserIdsAssignedToTeams: async (forWho) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${UsersURL}/${TeamsURL}`

      if (forWho) {
         url = url + '?forWho='+forWho
      }

      let getTeamMembershipResp = await fetch(url, {
         method: 'GET',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         }
      })

      if (getTeamMembershipResp.ok) {
         let  json = await getTeamMembershipResp.json()
         return json._result
      } else {
         throw('Error creating project!')
      }

   },

   manageMyTeamMembers: async (addMemberIds, removedMemberIds) => {

      let OMAPIRoot = getOMAPIRoot()
      let token = JSON.parse(sessionStorage.getItem('manage')).token

      let url = `${OMAPIRoot}/${UsersURL}/${TeamsURL}/${MyTeamURL}`

      let updateTeamResp = await fetch(url, {
         method: 'PUT',
         mode: 'cors',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({
            addedMemberIds: addMemberIds,
            removedMemberIds: removedMemberIds
         })
      })

      if (updateTeamResp.ok) {
         let  json = await updateTeamResp.json()
         return json._result
      } else {
         throw('Error managing team members!')
      }

   }

}

export default twinitUtils