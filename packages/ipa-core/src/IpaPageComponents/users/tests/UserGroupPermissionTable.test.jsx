import React from "react";
import { act } from "react-dom/test-utils";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as PlatformApi from "@dtplatform/platform-api";
import { UserGroupPermissionTable } from "../UserGroupPermissionTable";

const mockUserGroup = {
  _id: "123",
  _userAttributes: {
    project_workspace: {
      _namespaces: "test-namespace",
    },
  },
};

jest.mock("@dtplatform/platform-api", () => ({
  IafItemSvc: {
    getNamedUserItems: jest.fn().mockResolvedValue({
      _list: [
        {
          _itemClass: "NameUserCollection",
          _name: "ItemA",
          _description: "Description of ItemA",
          _id: "some_id",
        },
      ],
    }),
    getPermissions: jest.fn().mockResolvedValue({
      _list: [
        { _resourceDesc: { _irn: "fileirn:all" }, _actions: ["Read", "Write"] },
      ],
    }), // Ensure this is mocked as a resolved promise
  },
  IafPermission: {
    PermConst: {
      Action: {
        Read: "Read",
        Write: "Write",
        Delete: "Delete",
        All: "All",
      },
      UserType: {
        UserGroup: "UserGroup",
      },
      NamedUserItemIrnAll: "itemsvc:nameduseritem:*",
      FileIrnAll: "fileirn:all",
      AllAccessIrn: "all:access",
    },
  },
  IafFileSvc: {
    getPermissions: jest.fn().mockResolvedValue({
      _list: [
        { _resourceDesc: { _irn: "fileirn:all" }, _actions: ["Read", "Write"] },
      ],
    }),
  },
}));

describe("UserGroupPermissionTable", () => {
  test("renders file service and item service sections", async () => {
    await act(async () => {
      render(
        <UserGroupPermissionTable
          usergroup={mockUserGroup}
          allowManagePermissions={true}
        />,
      );
    });

    // Check if 'File Service' section header is present
    const fileServiceHeader = screen.getByText("File Service");
    expect(fileServiceHeader).not.toBeNull();

    // Check if 'Item Service' section header is present
    const itemServiceHeader = screen.getByText("Item Service");
    expect(itemServiceHeader).not.toBeNull();
  });

  test("renders mock user item on load of api call", async () => {
    // Mocked API call
    jest.spyOn(PlatformApi.IafItemSvc, "getNamedUserItems").mockResolvedValue({
      _list: [{ _itemClass: "NameUserCollection", _name: "ItemA" }],
    });

    // Wrap state updates and component rendering in act()
    await act(async () => {
      render(<UserGroupPermissionTable />);
    });

    // Now wait for the loading to finish and permissions to load
    await waitFor(() => expect(screen.getByText("ItemA")).not.toBeNull());
  });

  test("renders file permissions after loading", async () => {
    // Mock the API call to return a resolved value
    PlatformApi.IafItemSvc.getNamedUserItems.mockResolvedValue({
      _list: [{ _itemClass: "ClassA", _name: "ItemA", _id: "itemA_id" }],
    });

    PlatformApi.IafItemSvc.getPermissions.mockResolvedValue({
      _list: [
        { _resourceDesc: { _irn: "fileirn:all" }, _actions: ["Read", "Write"] },
      ],
    });

    // Use act() to wrap async operations that update state
    await act(async () => {
      render(<UserGroupPermissionTable />);
    });

    // Now wait for the elements to appear after data loading
    const table = screen.getByTestId("table");
    expect(table).not.toBeNull();

    // Check for a specific row or value in the table
    expect(screen.getByText("ItemA")).not.toBeNull();
  });

  test("opens the user items dropdown and selects an option from the list", async () => {
    PlatformApi.IafItemSvc.getNamedUserItems.mockResolvedValue({
      _list: [
        { _itemClass: "ClassA", _name: "ItemA", _id: "itemA_id" },
        { _itemClass: "ClassB", _name: "ItemB", _id: "itemB_id" },
      ],
    });

    let container;
    await act(
      async () => ({ container } = render(<UserGroupPermissionTable />)),
    );

    // Simulate the dropdown opening and selecting an option
    const dropdown = container.querySelector("#react-select-5-input");
    fireEvent.mouseDown(dropdown);

    const option = screen.getByText("ItemA");
    fireEvent.click(option);

    // Check if the option is selected
    expect(screen.getByText("ItemA")).not.toBeNull();
  });
});
