---
title: Overview
sidebar_position: 6
---

The Twinit.io framework is highly configurable. The user configuration defines the user group, related UI components, scripts that are invoked for the user’s actions, on a given resource. Applications built on Twinit.io are role-based and each user can have access to more than one role. The user chooses their role when they select which project they’re working with. Depending on which role is selected, the application will present only the features that have been configured for that role.  Each role is supported by its own User Config file.  

This topic documents all the possible contents of a User Config, but not all features are needed for every User Config.

## Top Level Configuration

At the top level, the User Config specifies:

* `pages` or `pageGroups` that indicate the role the user has access to
* The page handlers that configure how each of those pages functions
* `homepage` which sets the default page shown when a role is chosen 
* Other application-level configuration
  * `onConfigLoad` which provides the option of executing a callback function when the User Config has loaded
  * `entitySelectionConfig` which provides a common configuration for how the user searches for entities
  * `settings` that specifies miscellaneous application-level configuration 

## Page Handlers

We currently support the following handlers:

  * `EntityView` allows users to search for entities, review their data and perform other actions.  Currently used for assets, spaces, and files
  * `DashboardView` specifies the page layout and content
  * `UploadFilesWizard` supports adding files to the project
  * `DownloadsView` allows the user to download additional software 
  * `ScriptRunnerView` supports running and developing scripts
