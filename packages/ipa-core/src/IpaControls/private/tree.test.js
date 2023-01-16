import { InvalidNodeName, NODE_SEPARATOR, NotANodeInfo, parseNodeName, parseNodeNameWithParent, stringifyNode, stringifyNodeWithParent } from "./tree";


describe('tree.js', ()=>{


    describe('isNotNotInfo', ()=> {


        it('DOES NOT throw and error if nodeInfo is a proper NodeInfo object', ()=> {
            
            const nodeInfo = {level: 0, position: 1, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).not.toThrow(NotANodeInfo);
        });

        it('throws an error if nodeInfo is not an object', ()=> {
            let nodeInfo = "test"
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "obj" should be an object');

            nodeInfo = undefined
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "obj" should be an object');
        });

        it('throws an error if level is not a positive integer', ()=> {
            let nodeInfo = {level: undefined, position: 1, displayName: "Invicara"};
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');

            nodeInfo = {level: 3.2, position: 1, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');

            nodeInfo = {level: -3, position: 1, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');

            nodeInfo = {level: "3", position: 1, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');
        });

        it('throws an error if position is not a positive integer', ()=> {
            let nodeInfo = {level: 0, position: undefined, displayName: "Invicara"};
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "position" should be a positive integer');

            nodeInfo = {level: 0, position: 3.2, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "position" should be a positive integer');

            nodeInfo = {level: 0, position: -3, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "position" should be a positive integer');

            nodeInfo = {level: 0, position: "3", displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "position" should be a positive integer');
        });

        it('throws an error if displayName is not a string', ()=> {
            const nodeInfo = {level: 0, position: 1, displayName: undefined};
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "displayName" should be a string');
        });

        it('throws an error if displayName contains a NODE_SEPARATOR', ()=> {
            const nodeInfo = {level: 0, position: 1, displayName: `test${NODE_SEPARATOR}name`};

            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow(`The value provided is not a NodeInfo object: the property "displayName (${nodeInfo.displayName})" should be a string free of '${NODE_SEPARATOR}'`);
        });

    })


    describe('stringifyNode', ()=>{

        it('stringifies a node with dashes in name', ()=> {
            const nodeInfo = {level: 0, position: 1, displayName: "Welcome- to -Invicara - test-string"}
            expect(stringifyNode(nodeInfo)).toEqual('0-1-Welcome- to -Invicara - test-string');
        });

        it('throws an error if nodeInfo is not a proper NodeInfo object', ()=> {
            let nodeInfo = undefined
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "obj" should be an object');

            nodeInfo = {level: -1, position: 1, displayName: "Invicara"}
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');
        });

        it(`throws an error if displayName contains a ${NODE_SEPARATOR}`, ()=> {
            const nodeInfo = {level: 0, position: 1, displayName: `test${NODE_SEPARATOR}name`};
            expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNode(nodeInfo)).toThrow(`The value provided is not a NodeInfo object: the property "displayName (${nodeInfo.displayName})" should be a string free of '${NODE_SEPARATOR}'`);
        });
    })

    describe('stringifyNodeWithParent', ()=>{

        it("stringifies a node with it's parent name", ()=> {
            const parentNodeBaseName = "0-1-Welcome to"
            const childNodeInfo = {level: 1, position: 2, displayName: "Invicara"}
            expect(stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toEqual('0-1-Welcome to_1-2-Invicara');
        });

        it("stringifies a node without it's parent", ()=> {
            const parentNodeBaseName = undefined
            const childNodeInfo = {level: 1, position: 2, displayName: "Invicara"}
            expect(stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toEqual('1-2-Invicara');
        });

        it('throws an error if childNodeInfo is not a proper NodeInfo object', ()=> {
            const parentNodeBaseName = "0-1-Welcome to"
            let childNodeInfo = undefined
            expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "obj" should be an object');

            childNodeInfo = {level: -1, position: 1, displayName: "Invicara"}

            expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow(NotANodeInfo);
            expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');
        });
    })

    describe('parseNodeName', ()=>{

        it('parses a node name with dashes', ()=> {
            const nodeName = "0-1-Welcome- to -Invicara - test-string"
            expect(parseNodeName(nodeName)).toEqual({level: 0, position: 1, displayName: "Welcome- to -Invicara - test-string"});
        });

        it('throws an error if nodeInfo is not a proper NodeInfo object', ()=> {
            let nodeName = ""
            expect(() => parseNodeName(nodeName)).toThrow(NotANodeInfo);

            nodeName = "-1-1-Welcome- to -Invicara - test-string"
            expect(() => parseNodeName(nodeName)).toThrow(NotANodeInfo);
            expect(() => parseNodeName(nodeName)).toThrow('The value provided is not a NodeInfo object: the property "level" should be a positive integer');
        });
    })

    describe('parseNodeNameWithParent', ()=>{

        it('parses a node names with dashes', ()=> {
            const completeNodeName = "0-1-Welcome- to_1-2-Invi -cara";

            const result = {
                parentNodeInfo: {level: 0, position: 1, displayName: "Welcome- to"},
                childNodeInfo: {level: 1, position: 2, displayName: "Invi -cara"}
            }
            expect(parseNodeNameWithParent(completeNodeName)).toEqual(result);
        });

        it('throws an error if child or parent nodeInfo are not proper NodeInfo objects', ()=> {
            let completeNodeName = "0--1-Welcome-to_1-2-Invicara";
            expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(NotANodeInfo);

            completeNodeName = "0-1-Welcome_to_1-2-Invicara";
            expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(InvalidNodeName);

            completeNodeName = "0-1-Welcometo_-1-2-Invicara";
            expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(NotANodeInfo);

            completeNodeName = "0-1-Welcometo_1-2-Invic_ara";
            expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(InvalidNodeName);
        });
    })

});