"use client";

import React, { useState } from "react";
import { Flex, Typography, Input, Button } from "antd";
import { CopyOutlined, BgColorsOutlined } from "@ant-design/icons";
import { copyToClipboard } from "@/app/components/copyToClipboard";

const { Title, Paragraph } = Typography;

const ClientPage = () => {
  const [input, setInput] = useState("");
  const [attribute, setAttribute] = useState("");
  const [object, setObject] = useState("");
  const [jsonOutput, setJsonOutput] = useState([]);

  const handleInputChange = (e) => setInput(e.target.value);
  const handleAttributeChange = (e) => setAttribute(e.target.value);
  const handleObjectChange = (e) => setObject(e.target.value);

  const generateJson = () => {
    const lines = input.split("\n");
    const json = lines.map((line) => {
      const [langName, displayName] = line.split("\t");
      return { displayName, langName, object, attribute };
    });
    setJsonOutput(json);
  };

  return (
    <Flex gap="small" vertical>
      <Title level={3}>
        <BgColorsOutlined /> IMGPrompt 数据转换器
      </Title>
      <Paragraph type="secondary">
        本工具用于批量生成 IMGPrompt 数据。用户可以通过输入特定格式的文本（例如：显示名称与语言名称，用制表符分隔，即「displayName langName」）以及指定的对象和属性，来快速生成 JSON 格式的数据。
      </Paragraph>
      <Flex gap="small">
        <Input placeholder="对象 object" value={object} onChange={handleObjectChange} />
        <Input placeholder="属性 attribute" value={attribute} onChange={handleAttributeChange} />
      </Flex>
      <Input.TextArea rows={10} value={input} onChange={handleInputChange} placeholder="请输入内容，格式为：显示名称\t语言名称" />
      <Flex wrap="wrap" gap="small">
        <Button type="primary" onClick={generateJson}>
          生成 JSON
        </Button>
        <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(JSON.stringify(jsonOutput, null, 2))}>
          复制结果
        </Button>
      </Flex>
      <pre>{JSON.stringify(jsonOutput, null, 2)}</pre>
    </Flex>
  );
};

export default ClientPage;
