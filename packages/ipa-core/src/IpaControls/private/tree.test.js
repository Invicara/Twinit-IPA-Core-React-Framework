import {
  fetchLevelNodes,
  InvalidNodeName,
  NODE_SEPARATOR,
  NotANodeInfo,
  parseNodeName,
  parseNodeNameWithParent,
  stringifyNode,
  stringifyNodeWithParent,
} from './tree';

describe('tree.js', () => {
  describe('isNotNotInfo', () => {
    it('DOES NOT throw and error if nodeInfo is a proper NodeInfo object', () => {
      const nodeInfo = { level: 0, position: 1, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).not.toThrow(NotANodeInfo);
    });

    it('throws an error if nodeInfo is not an object', () => {
      let nodeInfo = 'test';
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "obj" should be an object'
      );

      nodeInfo = undefined;
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "obj" should be an object'
      );
    });

    it('throws an error if level is not a positive integer', () => {
      let nodeInfo = { level: undefined, position: 1, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );

      nodeInfo = { level: 3.2, position: 1, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );

      nodeInfo = { level: -3, position: 1, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );

      nodeInfo = { level: '3', position: 1, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );
    });

    it('throws an error if position is not a positive integer', () => {
      let nodeInfo = { level: 0, position: undefined, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "position" should be a positive integer'
      );

      nodeInfo = { level: 0, position: 3.2, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "position" should be a positive integer'
      );

      nodeInfo = { level: 0, position: -3, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "position" should be a positive integer'
      );

      nodeInfo = { level: 0, position: '3', displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "position" should be a positive integer'
      );
    });

    it('throws an error if displayName is not a string', () => {
      const nodeInfo = { level: 0, position: 1, displayName: undefined };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "displayName" should be a string'
      );
    });

    it('throws an error if displayName contains a NODE_SEPARATOR', () => {
      const nodeInfo = { level: 0, position: 1, displayName: `test${NODE_SEPARATOR}name` };

      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        `The value provided is not a NodeInfo object: the property "displayName (${nodeInfo.displayName})" should be a string free of '${NODE_SEPARATOR}'`
      );
    });
  });

  describe('stringifyNode', () => {
    it('stringifies a node with dashes in name', () => {
      const nodeInfo = {
        level: 0,
        position: 1,
        displayName: 'Welcome- to -Invicara - test-string',
      };
      expect(stringifyNode(nodeInfo)).toEqual('0-1-Welcome- to -Invicara - test-string');
    });

    it('throws an error if nodeInfo is not a proper NodeInfo object', () => {
      let nodeInfo = undefined;
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "obj" should be an object'
      );

      nodeInfo = { level: -1, position: 1, displayName: 'Invicara' };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );
    });

    it(`throws an error if displayName contains a ${NODE_SEPARATOR}`, () => {
      const nodeInfo = { level: 0, position: 1, displayName: `test${NODE_SEPARATOR}name` };
      expect(() => stringifyNode(nodeInfo)).toThrow(NotANodeInfo);
      expect(() => stringifyNode(nodeInfo)).toThrow(
        `The value provided is not a NodeInfo object: the property "displayName (${nodeInfo.displayName})" should be a string free of '${NODE_SEPARATOR}'`
      );
    });
  });

  describe('stringifyNodeWithParent', () => {
    it("stringifies a node with it's parent name", () => {
      const parentNodeBaseName = '0-1-Welcome to';
      const childNodeInfo = { level: 1, position: 2, displayName: 'Invicara' };
      expect(stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toEqual(
        '0-1-Welcome to_1-2-Invicara'
      );
    });

    it("stringifies a node without it's parent", () => {
      const parentNodeBaseName = undefined;
      const childNodeInfo = { level: 1, position: 2, displayName: 'Invicara' };
      expect(stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toEqual('1-2-Invicara');
    });

    it('throws an error if childNodeInfo is not a proper NodeInfo object', () => {
      const parentNodeBaseName = '0-1-Welcome to';
      let childNodeInfo = undefined;
      expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow(
        NotANodeInfo
      );
      expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "obj" should be an object'
      );

      childNodeInfo = { level: -1, position: 1, displayName: 'Invicara' };

      expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow(
        NotANodeInfo
      );
      expect(() => stringifyNodeWithParent(parentNodeBaseName, childNodeInfo)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );
    });
  });

  describe('parseNodeName', () => {
    it('parses a node name with dashes', () => {
      const nodeName = '0-1-Welcome- to -Invicara - test-string';
      expect(parseNodeName(nodeName)).toEqual({
        level: 0,
        position: 1,
        displayName: 'Welcome- to -Invicara - test-string',
      });
    });

    it('throws an error if nodeInfo is not a proper NodeInfo object', () => {
      let nodeName = '';
      expect(() => parseNodeName(nodeName)).toThrow(NotANodeInfo);

      nodeName = '-1-1-Welcome- to -Invicara - test-string';
      expect(() => parseNodeName(nodeName)).toThrow(NotANodeInfo);
      expect(() => parseNodeName(nodeName)).toThrow(
        'The value provided is not a NodeInfo object: the property "level" should be a positive integer'
      );
    });
  });

  describe('parseNodeNameWithParent', () => {
    it('parses a node names with dashes', () => {
      const completeNodeName = '0-1-Welcome- to_1-2-Invi -cara';

      const result = {
        parentNodeInfo: { level: 0, position: 1, displayName: 'Welcome- to' },
        childNodeInfo: { level: 1, position: 2, displayName: 'Invi -cara' },
      };
      expect(parseNodeNameWithParent(completeNodeName)).toEqual(result);
    });

    it('parses the names of nodes below the second level', () => {
      expect(parseNodeNameWithParent('0-0-Level1_1-0-Level2_2-3-Level3')).toEqual({
        parentNodeInfo: { level: 1, position: 0, displayName: 'Level2' },
        childNodeInfo: { level: 2, position: 3, displayName: 'Level3' },
      });
      expect(
        parseNodeNameWithParent('0-6-Toilet - Accessories_1-1-Bib Tap_2-0-01-First Floor_3-2-T-01')
      ).toEqual({
        parentNodeInfo: { level: 2, position: 0, displayName: '01-First Floor' },
        childNodeInfo: { level: 3, position: 2, displayName: 'T-01' },
      });
    });

    it('throws an error if a deeper name part is not the base name of its level', () => {
      expect(() => parseNodeNameWithParent('0-0-Level1_2-0-Level2_1-0-Level3')).toThrow(
        InvalidNodeName
      );
    });

    it('throws an error if child or parent nodeInfo are not proper NodeInfo objects', () => {
      let completeNodeName = '0--1-Welcome-to_1-2-Invicara';
      expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(NotANodeInfo);

      completeNodeName = '0-1-Welcome_to_1-2-Invicara';
      expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(InvalidNodeName);

      completeNodeName = '0-1-Welcometo_-1-2-Invicara';
      expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(NotANodeInfo);

      completeNodeName = '0-1-Welcometo_1-2-Invic_ara';
      expect(() => parseNodeNameWithParent(completeNodeName)).toThrow(InvalidNodeName);
    });
  });

  describe('fetchLevelNodes', () => {
    const treeLevel = { property: 'Reference', script: 'getReferencesWithCount' };
    let consoleError;

    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleError.mockRestore();
    });

    it('returns the script result when it is a list', async () => {
      const nodes = [{ name: 'W12X79', childCount: 4 }];
      await expect(fetchLevelNodes(async () => nodes, treeLevel, 2)).resolves.toBe(nodes);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('returns no nodes and names the script when the script is missing', async () => {
      const notFound = 'executeScript "getReferencesWithCount" not found on loadedScripts!';
      await expect(fetchLevelNodes(async () => notFound, treeLevel, 2)).resolves.toEqual([]);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError.mock.calls[0][0]).toContain('level 2');
      expect(consoleError.mock.calls[0][0]).toContain('getReferencesWithCount');
    });

    it('returns no nodes when the script returns nothing', async () => {
      await expect(fetchLevelNodes(async () => undefined, treeLevel, 2)).resolves.toEqual([]);
      expect(consoleError).toHaveBeenCalledTimes(1);
    });

    it('returns no nodes when the script throws', async () => {
      const failing = async () => {
        throw new Error('boom');
      };
      await expect(fetchLevelNodes(failing, treeLevel, 3)).resolves.toEqual([]);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError.mock.calls[0][0]).toContain('threw');
    });
  });
});
