import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import styles from './styles.module.css';

const jsonPrefix = "  ...,\n  ";
const jsonSuffix = ",\n  ...";

const jsPrefix = "const vc = new VitessceConfig(\"My config\");\n";

export default function ViewConfigTabs(props) {
    const { json, js } = props;

    return (
        <div className={styles.viewConfigTabs}>
            <Tabs
                groupId="vc-js-json"
                defaultValue="json"
                values={[
                    {label: 'JSON', value: 'json'},
                    {label: 'JS API', value: 'js'},
                ]}
            >
                <TabItem value="json">
                    <CodeBlock className="language-javascript">{jsonPrefix + json.trim() + jsonSuffix}</CodeBlock>
                </TabItem>
                <TabItem value="js">
                    <CodeBlock className="language-javascript">{jsPrefix + js.trim()}</CodeBlock>
                </TabItem>
            </Tabs>
        </div>
    );
}
