"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Row, Col, Button, Form, Typography, Input, message, Card, Space } from "antd";
import { CopyOutlined, FileSyncOutlined } from "@ant-design/icons";
import { JSONPath } from "jsonpath-plus";
import KeyMappingInput from "@/app/components/KeyMappingInput";
import { preprocessJson } from "@/app/components/preprocessJson";
import { copyToClipboard } from "@/app/components/copyToClipboard";

const { Title, Paragraph } = Typography;

const defaultMappings = [
  { inputKey: "en.prompt", outputKey: "ar.prompt" },
  { inputKey: "en.prompt", outputKey: "bn.prompt" },
  { inputKey: "en.prompt", outputKey: "de.prompt" },
  { inputKey: "en.prompt", outputKey: "es.prompt" },
  { inputKey: "en.prompt", outputKey: "fr.prompt" },
  { inputKey: "en.prompt", outputKey: "hi.prompt" },
  { inputKey: "en.prompt", outputKey: "it.prompt" },
  { inputKey: "en.prompt", outputKey: "ja.prompt" },
  { inputKey: "en.prompt", outputKey: "ko.prompt" },
  { inputKey: "en.prompt", outputKey: "pt.prompt" },
  { inputKey: "en.prompt", outputKey: "ru.prompt" },
];

const ClientPage = () => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [isPresetUsed, setIsPresetUsed] = useState<boolean>(false);
  const [keyMappings, setKeyMappings] = useState<Array<{ inputKey: string; outputKey: string; id: number }>>([{ inputKey: "", outputKey: "", id: 0 }]);

  const memoizedDefaultMappings = useMemo(() => defaultMappings.map((mapping, index) => ({ ...mapping, id: index })), []);

  const handleEdit = useCallback(() => {
    if (!jsonInput) {
      message.error("JSON Input 不能为空");
      return;
    }
    setJsonOutput("");

    let jsonObject;
    try {
      jsonObject = preprocessJson(jsonInput);
    } catch (error) {
      message.error("JSON Input 格式错误或无法处理");
      return;
    }

    let hasError = false;

    for (const mapping of keyMappings) {
      if (!mapping.inputKey || !mapping.outputKey) {
        message.error("输入键或输出键不能为空");
        hasError = true;
        break;
      }
      const inputNodes = JSONPath({ path: `$..${mapping.inputKey}`, json: jsonObject, resultType: "all" });
      const outputNodes = JSONPath({ path: `$..${mapping.outputKey}`, json: jsonObject, resultType: "all" });

      if (inputNodes.length === 0) {
        message.error(`输入键 ${mapping.inputKey} 在 JSON 中找不到`);
        hasError = true;
        break;
      }
      if (outputNodes.length === 0) {
        message.error(`输出键 ${mapping.outputKey} 在 JSON 中找不到`);
        hasError = true;
        break;
      }

      inputNodes.forEach((node, index) => {
        const outputNodePathArray = JSONPath.toPathArray(outputNodes[index].path);
        if (outputNodePathArray && outputNodePathArray.length > 0) {
          let currentNode = jsonObject;
          for (let i = 1; i < outputNodePathArray.length - 1; i++) {
            currentNode = currentNode[outputNodePathArray[i]];
          }
          currentNode[outputNodePathArray[outputNodePathArray.length - 1]] = node.value;
        }
      });
    }

    if (!hasError) {
      setJsonOutput(JSON.stringify(jsonObject, null, 2));
    }
  }, [jsonInput, keyMappings]);

  const toggleUsePreset = useCallback(() => {
    setIsPresetUsed((prev) => !prev);
  }, []);

  useEffect(() => {
    setKeyMappings(isPresetUsed ? memoizedDefaultMappings : [{ inputKey: "", outputKey: "", id: 0 }]);
  }, [isPresetUsed, memoizedDefaultMappings]);

  return (
    <>
      <Title level={3}>
        <FileSyncOutlined /> JSON 键值替换工具
      </Title>
      <Paragraph type="secondary">
        通过键映射（key mapping）来修改 JSON 数据。用户可以输入一对键（输入键和输出键），该工具会查找 JSON 数据中的输入键位置，然后将对应位置的值替换为输出键位置的值。
      </Paragraph>
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="输入区">
            <Button onClick={toggleUsePreset} style={{ marginBottom: "12px" }}>
              {isPresetUsed ? "自定义映射" : "使用预设映射（AIShort）"}
            </Button>
            {!isPresetUsed && <KeyMappingInput keyMappings={keyMappings} setKeyMappings={setKeyMappings} />}

            <Form.Item>
              <Input.TextArea placeholder="JSON Input" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10} />
            </Form.Item>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="结果区">
            <Space style={{ marginBottom: "12px" }}>
              <Button type="primary" onClick={handleEdit}>
                Edit Json
              </Button>
              <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(jsonOutput)}>
                Copy Result
              </Button>
            </Space>
            <Form.Item>
              <Input.TextArea placeholder="JSON Output" value={jsonOutput} rows={10} readOnly />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ClientPage;
