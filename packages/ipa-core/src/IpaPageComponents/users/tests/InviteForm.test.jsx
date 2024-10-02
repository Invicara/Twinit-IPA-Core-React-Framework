import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InviteForm } from "../InviteForm";

describe("InviteForm Component", () => {
  const mockOnInvitesSent = jest.fn();
  const mockUsers = [{ _email: "test@example.com" }];
  const mockUserGroups = [{ _id: "1", _name: "Group 1" }];
  const mockProject = { _name: "Project A" };
  const mockCurrentUser = { _firstname: "John", _lastname: "Doe" };
  const mockAppName = "MyApp";
  const mockAppUrl = "http://foo.bar";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock external API call
  jest.mock("@dtplatform/platform-api", () => ({
    IafUserGroup: {
      inviteUsersToGroup: jest.fn(),
    },
  }));

  test("renders the invite form with all elements", () => {
    render(
      <InviteForm
        appName={mockAppName}
        appUrl={mockAppUrl}
        currentUser={mockCurrentUser}
        users={mockUsers}
        userGroups={mockUserGroups}
        project={mockProject}
        onInvitesSent={mockOnInvitesSent}
      />,
    );

    // Check if all the main elements are rendered
    expect(screen.getAllByText("Send Invites")).not.toBeNull();
    expect(screen.getByText("Email")).not.toBeNull();
    expect(screen.getAllByText("Select UserGroups")).not.toBeNull();
    expect(screen.getByText("Add Email")).not.toBeNull();
  });

  test("shows an error message for invalid email", async () => {
    render(
      <InviteForm
        appName={mockAppName}
        appUrl={mockAppUrl}
        currentUser={mockCurrentUser}
        users={mockUsers}
        userGroups={mockUserGroups}
        project={mockProject}
        onInvitesSent={mockOnInvitesSent}
      />,
    );

    // Enter an invalid email
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByText("Add Email"));

    // Wait for the error message to appear
    await waitFor(() => {
      const errorMessage = screen.queryByText("Invalid email address!");
      expect(errorMessage).toBeTruthy(); // Change here
    });
  });

  test("adds a valid email to the list", async () => {
    render(
      <InviteForm
        appName={mockAppName}
        appUrl={mockAppUrl}
        currentUser={mockCurrentUser}
        users={mockUsers}
        userGroups={mockUserGroups}
        project={mockProject}
        onInvitesSent={mockOnInvitesSent}
      />,
    );

    // Enter a valid email
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Add Email"));

    await waitFor(() => {
      const emailItem = screen.queryByText("test@example.com");
      expect(emailItem).toBeTruthy();
    });
  });

  test("calls onInvitesSent when invites are sent", async () => {
    const mockOnInvitesSent = jest.fn();
    const mockAppName = "MyApp";
    const mockAppUrl = "http://myapp.com";
    const mockCurrentUser = { id: "1", _firstname: "Test", _lastname: "User" };
    const mockUsers = [
      { id: "2", _email: "john@example.com", name: "John Doe" },
    ];
    const mockUserGroups = [
      { _id: "1", _name: "Admins" },
      { _id: "2", _name: "Developers" },
    ];
    const mockProject = { _name: "Test Project" };

    const { container } = render(
      <InviteForm
        appName={mockAppName}
        appUrl={mockAppUrl}
        currentUser={mockCurrentUser}
        users={mockUsers}
        userGroups={mockUserGroups}
        project={mockProject}
        onInvitesSent={mockOnInvitesSent}
      />,
    );

    // Query for the user group dropdown and select the first group
    const userGroupSelectInput = container.querySelector(
      ".select-usergroups-label + div",
    );
    expect(userGroupSelectInput).not.toBeNull();

    // Step 2: Simulate clicking to open the dropdown
    fireEvent.mouseDown(userGroupSelectInput.querySelector("div")); // Open the dropdown by triggering mousedown event

    // Step 3: Wait for the "Admins" option to appear in the dropdown
    const adminOption = await screen.findByText("Admins");
    expect(adminOption).not.toBeNull();

    // Step 4: Simulate selecting the "Admins" option
    fireEvent.click(adminOption);

    // Wait for the email input to appear and then query it
    await waitFor(() => {
      const emailInput = container.querySelector("#email-input");
      expect(emailInput).not.toBeNull();
    });

    const emailInput = container.querySelector("#email-input");

    // If emailInput is still null, log it out for debugging
    if (!emailInput) {
      console.log(container.innerHTML);
    }

    // Fire the change event to enter an email
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com"); // Verify the email is in the input field

    // Query for the 'Add Email' button and click it
    const addEmailButton = screen.getByText("Add Email");
    fireEvent.click(addEmailButton);

    await waitFor(() => {
      const selectedGroup = screen.getByText("Admins"); // Check if "Admins" is now displayed in the input
      expect(selectedGroup).not.toBeNull();
    });

    const allButtons = container.querySelectorAll(".simple-button");
    const sendInvitesButton = allButtons[allButtons.length - 1];
    expect(sendInvitesButton).not.toBeNull();
    fireEvent.click(sendInvitesButton);

    //Wait for onInvitesSent to be called once
    await waitFor(() => {
      expect(mockOnInvitesSent).toHaveBeenCalledTimes(1);
    });
  });

  test("selects a group from the user group dropdown successfully", async () => {
    const mockOnInvitesSent = jest.fn();
    const mockAppName = "MyApp";
    const mockAppUrl = "http://myapp.com";
    const mockCurrentUser = { id: "1", _firstname: "Test", _lastname: "User" };
    const mockUsers = [
      { id: "2", _email: "john@example.com", name: "John Doe" },
    ];
    const mockUserGroups = [
      { _id: "1", _name: "Admins" },
      { _id: "2", _name: "Developers" },
    ];
    const mockProject = { _name: "Test Project" };

    // Render the InviteForm component
    const { container, getByText, getByPlaceholderText } = render(
      <InviteForm
        appName={mockAppName}
        appUrl={mockAppUrl}
        currentUser={mockCurrentUser}
        users={mockUsers}
        userGroups={mockUserGroups}
        project={mockProject}
        onInvitesSent={mockOnInvitesSent}
      />,
    );

    const userGroupSelectInput = container.querySelector(
      ".select-usergroups-label + div",
    ); // Use adjacent selector to grab react-select container
    expect(userGroupSelectInput).not.toBeNull(); // Ensure the input is rendered

    // Step 2: Simulate clicking to open the dropdown
    fireEvent.mouseDown(userGroupSelectInput.querySelector("div")); // Open the dropdown by triggering mousedown event

    // Step 3: Wait for the "Admins" option to appear in the dropdown
    const adminOption = await screen.findByText("Admins"); // Use `findByText` to wait for the "Admins" option to appear
    expect(adminOption).not.toBeNull();

    // Step 4: Simulate selecting the "Admins" option
    fireEvent.click(adminOption);

    // Step 4: Verify that the selected group appears in the UI
    await waitFor(() => {
      const selectedGroup = screen.getByText("Admins"); // Check if "Admins" is now displayed in the input
      expect(selectedGroup).not.toBeNull();
    });
  });
});
