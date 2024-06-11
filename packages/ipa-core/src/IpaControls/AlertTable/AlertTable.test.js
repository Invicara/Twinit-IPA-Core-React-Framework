import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import _ from 'lodash'
import {expect, test} from '@jest/globals'
import '@testing-library/jest-dom'
import {AlertTable, getHeaders, getRowsFromAlerts, inactivateAlert} from './AlertTable.jsx'
import ScriptedAlertTable  from "./ScriptedAlertTable.jsx";
import {testProps, newRowsData} from './testData.js'

describe('AlertTable.js', () => {

    test("Component renders on the screen", () => {
        render(<AlertTable title={testProps.title} columns={testProps.columns} navigateTo={testProps.navigateTo} alerts={testProps.alerts} />);
        const AlertTableTitle = screen.getByText('System Alerts')
        expect(AlertTableTitle).toBeInTheDocument()
    });

    test("No active alert, component does not render", () => {
        const data = {_list: []}
        render(<ScriptedAlertTable data={data} />);
        expect(screen.queryByText('System Alerts')).not.toBeInTheDocument();
    });

    test("navigate to alert source", async() => {
        const onNavigate = jest.fn()

        render(<AlertTable title={testProps.title} columns={testProps.columns} navigateTo={testProps.navigateTo} onNavigate={onNavigate} alerts={testProps.alerts} />);
        const button = await screen.findByTestId('navigate-button')
        fireEvent.click(button);
        expect(onNavigate).toHaveBeenCalled()
    });

    test("getHeaders function", () => {
        expect(getHeaders(testProps.columns)).toStrictEqual(["Alert", "", "Source", "Urgency", "Keywords", ""])
    });
    
    test("inactivateAlert function", () => {
        const setAcknowledgedAlert = jest.fn()
        const funcCall = inactivateAlert(testProps.alerts[0], false, setAcknowledgedAlert, undefined)
        expect(funcCall.properties.Acknowledged.val).toStrictEqual(true)
    });

    test("getRowsFromAlerts function", () => {
        const result = getRowsFromAlerts(testProps.alerts, testProps.columns, testProps.navigationConfig)
        expect(result[0][1]).toStrictEqual(newRowsData)
    });
})
