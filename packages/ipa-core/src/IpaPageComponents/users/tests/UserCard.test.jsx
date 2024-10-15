import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserCard } from "../UserCard";

describe("UserCard Component", () => {
  const mockUser = {
    _firstname: "John",
    _lastname: "Doe",
    _email: "test@example.com",
  };

  const mockOnClick = jest.fn();
  const mockOnRemoveUser = jest.fn();
  const mockCanRemoveUser = jest
    .fn()
    .mockResolvedValue({ allow: true, message: "Can remove this user" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders user information correctly", () => {
    render(<UserCard user={mockUser} />);

    // Check if the user's full name and email are rendered
    expect(screen.getByText("Doe, John")).not.toBeNull();
    expect(screen.getByText("test@example.com")).not.toBeNull();
  });

  test("renders as selectable and handles click", () => {
    render(
      <UserCard user={mockUser} selectable={true} onClick={mockOnClick} />,
    );

    const listItem = screen.getByText("test@example.com").closest("li");
    fireEvent.click(listItem);

    // Expect the onClick handler to have been called
    expect(mockOnClick).toHaveBeenCalled();
  });

  test("renders delete icon and confirms remove process", async () => {
    render(
      <UserCard
        user={mockUser}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    // Ensure the delete icon is rendered
    const deleteIcon = screen.getByTestId("delete-icon");
    expect(deleteIcon).not.toBeNull();

    fireEvent.click(deleteIcon);

    // Ensure confirmRemove is triggered and awaits the result
    await waitFor(() =>
      expect(mockCanRemoveUser).toHaveBeenCalledWith(mockUser),
    );

    // Ensure the action text is updated
    expect(screen.getByText("Can remove this user")).not.toBeNull();

    // Simulate clicking the confirm (check) icon to remove the user
    const confirmIcon = screen.getByTestId("confirm-icon");
    fireEvent.click(confirmIcon);

    // Ensure the onRemoveUser handler is called
    expect(mockOnRemoveUser).toHaveBeenCalledWith(mockUser);
  });

  test("cancels remove action", async () => {
    render(
      <UserCard
        user={mockUser}
        showActions={true}
        canRemoveUser={mockCanRemoveUser}
        onRemoveUser={mockOnRemoveUser}
      />,
    );

    // Simulate clicking the delete icon
    const deleteIcon = screen.getByTestId("delete-icon");
    fireEvent.click(deleteIcon);

    // Wait for the confirmRemove to be called and action text to appear
    await waitFor(() =>
      expect(screen.getByText("Can remove this user")).not.toBeNull(),
    );

    // Simulate clicking the cancel icon
    const cancelIcon = screen.getByTestId("cancel-icon");
    fireEvent.click(cancelIcon);

    // Ensure that the deletion process is cancelled and no remove action was taken
    expect(mockOnRemoveUser).not.toHaveBeenCalled();
  });
});
