import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { GroupCard } from "../GroupCard";

describe("GroupCard Component", () => {
  const mockGroup = { _name: "Test Group" };
  const mockCanRemoveUser = jest.fn();
  const mockOnRemoveUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders selectable group card correctly", () => {
    const mockOnClick = jest.fn();

    render(
      <GroupCard
        group={mockGroup}
        selectable={true}
        isSelected={false}
        onClick={mockOnClick}
      />,
    );

    const listItem = screen.getByText("Test Group");
    expect(listItem).toBeTruthy();
    expect(listItem.classList.contains("selectable")).toBe(true);

    fireEvent.click(listItem);
    expect(mockOnClick).toHaveBeenCalledTimes(1); // Ensures onClick was called once
  });

  test("renders non-selectable group card with actions", async () => {
    render(
      <GroupCard
        group={mockGroup}
        disabled={false}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    const groupName = screen.getByText("Test Group");
    expect(groupName).toBeTruthy(); // Ensures the group name is rendered

    // Check if the list item has the expected class
    const listItem = groupName.closest("li"); // Get the closest 'li' element
    expect(listItem.classList.contains("user-group-list-item")).toBe(true); // Checks for the proper class

    const trashIcon = screen.getByRole("button");
    expect(trashIcon).toBeTruthy();

    fireEvent.click(trashIcon);
    expect(mockCanRemoveUser).toHaveBeenCalled(); // Ensures canRemoveUser is called when delete icon is clicked
  });

  test("cancel remove action works correctly", () => {
    render(
      <GroupCard
        group={mockGroup}
        disabled={false}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    // Initially, "Cancel" link should appear as part of the deletion UI
    const cancelLink = screen.getByText(/Cancel/i);
    expect(cancelLink).toBeTruthy(); // Ensure "Cancel" link is rendered

    fireEvent.click(cancelLink);

    // The cancel link should no longer be in the document after it's clicked
    expect(screen.queryByText(/Cancel/i)).toBeNull(); // The query should return null if the element is not found
  });

  test("confirm remove action works correctly", async () => {
    // Mocking the `canRemoveUser` to return an object with `allow` and `message`
    mockCanRemoveUser.mockResolvedValueOnce({
      allow: true,
      message: "Confirm Remove User from Group",
    });

    render(
      <GroupCard
        group={mockGroup}
        disabled={false}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    const trashIcon = screen.getByRole("button"); // Find the delete icon
    fireEvent.click(trashIcon); // Simulate clicking the delete icon

    // Wait for async actions to finish
    await waitFor(() => expect(mockCanRemoveUser).toHaveBeenCalledTimes(1)); // Ensure `canRemoveUser` is called
    expect(mockCanRemoveUser).toHaveBeenCalledWith(null, mockGroup); // Check if it's called with correct arguments

    // Verify that the action text is updated with the message returned by `canRemoveUser`
    expect(screen.getByText("Confirm Remove User from Group")).toBeTruthy();
  });

  test("displays loading spinner when removing user", async () => {
    mockCanRemoveUser.mockResolvedValue({
      allow: true,
      message: "You can remove this user.",
    });

    render(
      <GroupCard
        group={mockGroup}
        disabled={false}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    const trashIcon = screen.getByRole("button");
    fireEvent.click(trashIcon);

    // Simulate confirming removal
    const removeLink = await waitFor(() => screen.getByText(/remove user/i)); // regex to handle potential variations
    fireEvent.click(removeLink);

    await waitFor(() => {
      const removingText = screen.queryByText(/removing user/i);
      expect(removingText).not.toBeNull(); // Check that the element is found and not null
    });
  });

  it('does not show "Remove User" link if remove is not allowed', async () => {
    // Mock the `canRemoveUser` function to resolve with allow: false
    const mockCanRemoveUser = jest.fn().mockResolvedValueOnce({
      allow: false,
      message: "You can't remove your user from the current UserGroup",
    });

    // Mock the `onRemoveUser` function
    const mockOnRemoveUser = jest.fn();

    // Render the component with the mocked functions and required props
    render(
      <GroupCard
        group={{ _name: "Test Group" }}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    // Simulate clicking the delete (trash) icon to trigger the removal process
    const trashIcon = screen.getByRole("button"); // Ensure correct role is set for the delete icon
    fireEvent.click(trashIcon);

    // Wait for the async function to resolve and update the UI
    await waitFor(() => expect(mockCanRemoveUser).toHaveBeenCalled());

    // Check that the "Remove User" link/button is not displayed
    const removeLink = screen.queryByText(/Remove User/i);
    expect(removeLink).toBe(null); // Assert that the "Remove User" link is not rendered
  });
});
