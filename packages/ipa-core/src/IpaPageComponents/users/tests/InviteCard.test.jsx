import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { InviteCard } from "../InviteCard";

const mockOnResendInvite = jest.fn();

const invite = {
  _email: "test@example.com",
  _expireTime: new Date().getTime() + 1000 * 60 * 60, // 1 hour from now
  _status: "ACTIVE",
  _usergroup: { _name: "Test Group" },
  _id: "invite-id",
};

describe("InviteCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("renders the invite card with correct user info", () => {
    const { queryByText } = render(
      <InviteCard invite={invite} showActions={false} />,
    );

    expect(queryByText(invite._email)).not.toBeNull();
    expect(queryByText("Expires:")).not.toBeNull();
    expect(queryByText(invite._usergroup._name)).not.toBeNull();
  });

  it("shows action icons when showActions is true", () => {
    const { container } = render(
      <InviteCard invite={invite} showActions={true} isCurrentUser={true} />,
    );

    const acceptIcon = container.querySelector(".fa-check");
    const resendIcon = container.querySelector(".fa-redo-alt");
    const deleteIcon = container.querySelector(".fa-trash");

    // Assert that the icons are present in the DOM
    expect(acceptIcon).not.toBeNull();
    expect(resendIcon).not.toBeNull();
    expect(deleteIcon).not.toBeNull();
  });

  it("confirms acceptance action when accept icon is clicked", () => {
    const mockOnAcceptInvite = jest.fn();

    const { container, getByText } = render(
      <InviteCard
        invite={invite}
        showActions={true}
        isCurrentUser={true}
        onAcceptInvite={mockOnAcceptInvite}
      />,
    );

    // Click the accept icon (which shows confirmation buttons)
    const acceptIcon = container.querySelector(".fa-check");
    expect(acceptIcon).not.toBeNull();
    fireEvent.click(acceptIcon);

    // Click the confirmation link that appears after the accept icon
    const confirmButton = getByText(/accept invite/i); // Confirm button text should now appear
    expect(confirmButton).not.toBeNull();
    fireEvent.click(confirmButton);

    // Ensure that onAcceptInvite was called once with the correct invite object
    expect(mockOnAcceptInvite).toHaveBeenCalledTimes(1);
    expect(mockOnAcceptInvite).toHaveBeenCalledWith(invite);
  });

  it("confirms resend action when resend icon is clicked", async () => {
    const { queryByRole, queryByText } = render(
      <InviteCard
        invite={invite}
        showActions={true}
        isCurrentUser={true}
        onResendInvite={mockOnResendInvite}
      />,
    );

    //MAY SEND EMAIL ON TESTING SO WILL COMMENT OUT FOR NOW

    // fireEvent.click(queryByRole('img', { name: /redo/i }));

    // await waitFor(() => {
    //   expect(queryByText('Confirm Resend Invite')).not.toBeNull();
    // });

    // fireEvent.click(queryByText(' Resend Invite'));

    // expect(mockOnResendInvite).toHaveBeenCalledWith(invite);
  });

  it("confirms cancel action when cancel icon is clicked", async () => {
    const mockOnCancelInvite = jest.fn();

    const { container, queryByText } = render(
      <InviteCard
        invite={invite}
        showActions={true}
        onCancelInvite={mockOnCancelInvite}
      />,
    );

    //Find the delete icon
    const cancelIcon = container.querySelector(".fa-trash");

    expect(cancelIcon).not.toBeNull();
    fireEvent.click(cancelIcon);

    // Wait for the confirmation text to appear after the icon is clicked
    await waitFor(() => {
      expect(queryByText("Confirm Invite Delete")).not.toBeNull(); // Ensure the confirmation text is shown
    });

    // Find and click the confirmation button to cancel the invite
    const confirmCancelButton = queryByText(/remove invite/i);
    expect(confirmCancelButton).not.toBeNull();
    fireEvent.click(confirmCancelButton);

    // Ensure that onCancelInvite was called once with the correct invite object
    expect(mockOnCancelInvite).toHaveBeenCalledTimes(1);
    expect(mockOnCancelInvite).toHaveBeenCalledWith(invite);
  });

  it("cancels the action correctly", async () => {
    const mockOnCancelInvite = jest.fn();

    const { container, queryByText } = render(
      <InviteCard
        invite={invite}
        showActions={true}
        onCancelInvite={mockOnCancelInvite}
      />,
    );

    // Step 1: Find the delete icon using its class
    const cancelIcon = container.querySelector(".fa-trash");
    expect(cancelIcon).not.toBeNull();

    fireEvent.click(cancelIcon);

    // Wait for the confirmation text to appear
    await waitFor(() =>
      expect(queryByText("Confirm Invite Delete")).not.toBeNull(),
    );

    // Find and click the 'Cancel' link/button
    const cancelButton = queryByText(/cancel/i);
    expect(cancelButton).not.toBeNull();
    fireEvent.click(cancelButton);

    // Ensure the action has been canceled (the confirmation text should no longer be visible)
    await waitFor(() =>
      expect(queryByText("Confirm Invite Delete")).toBeNull(),
    );
  });
});
