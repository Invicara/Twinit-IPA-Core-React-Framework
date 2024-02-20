# hOurs
Application for employee time sheet submittal, approval, and export built internally on Twinit.

## Detailed Application Information

More detailed information regarding hOurs including its data model can be found on Confluence [here](https://invicara.atlassian.net/wiki/spaces/PDSD/pages/3663921197/hOurs)

## Run Local Development

1. npm install
2. npm run watch

Note: You must have access to the hours application and a project in order to log in to this client.

## How to Set Up hOurs for the First Time

0. Create a project on an instance of Twinit
1. Add the 1.0.0_new_project_setup script to the project
2. Run Step 1 to create the item service collections
3. Run Step 2 to create the user groups, add their user configs, and set user group permissions
4. Create a new script named 'hOurs Orchestrator Scripts' with _userType 'hours-orch'
5. Populate it with the script from app-setup/scripts/1.0.0_hours_orch_scripts.mjs
6. Commit the script to Twinit
7. Run Step 3 to create the orchestrator which continue to create new month collections in the item service
8. Run Step 4 and select the './app-setup/Initial Projects.xlsx' spreadsheet to pre-populate projects (optionally)
9. Run Step 5 to add the OMAPI and the user group permissions for users to access the OMAPI script and endpoints
10. Create a new script named 'hOurs OMAPI Scripts' with _userType 'hours-omapi'
11. Populate it with the script from app-setup/scripts/1.0.0_hours_omapi_scripts.mjs
12. Commit the script to Twinit
13. If this will be a production project of hOurs then run Step 6a to mark the project as Production
14. Login as Admin and invite users to the admin, reporter, and managers user groups