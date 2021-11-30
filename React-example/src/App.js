import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './dx-styles.scss';
import { DataGrid } from 'devextreme-react';
import { Sorting, Selection, Column } from 'devextreme-react/data-grid';
import data from './api/data';
import GroupTemplate from './api/group-template';

function App() {

  const [fields] = useState(data);
  const [groupedData, setGroupedData] = useState([])
  const [keyExpr] = useState("ProductID")


  const getKeys = function (
    data,
    keys,
    groupedColumnName,
    groupKey,
    keyFieldName
  ) {
    let groupRow = data.find((i) => {
      return i.key === groupKey;
    });
    if (groupRow) keys = groupRow.items.map((i) => i[keyFieldName]);
    return keys;
  };
  const checkIfKeysAreSelected = function (currentKeys, selectedKeys) {
    let count = 0;

    if (selectedKeys.length === 0) return false;
    for (var i = 0; i < currentKeys.length; i++) {
      var keyValue = currentKeys[i];
      if (selectedKeys.indexOf(keyValue) > -1)
        // key is not selected
        count++;
    }
    if (count === 0) return false;
    if (currentKeys.length === count) return true;
    else return undefined;
  };
  const getGroupText = (
    column,
    text,
    groupContinuesMessage,
    groupContinuedMessage
  ) => {
    let groupText = "";
    groupText = column.caption + ": " + text;
    if (groupContinuedMessage && groupContinuesMessage) {
      groupText +=
        " (" + groupContinuedMessage + ". " + groupContinuesMessage + ")";
    } else if (groupContinuesMessage) {
      groupText += " (" + groupContinuesMessage + ")";
    } else if (groupContinuedMessage) {
      groupText += " (" + groupContinuedMessage + ")";
    }
    return groupText;
  };

  const onSelectionChanged = (args) => {
    let keys = groupedData.slice();
    setGroupedData(keys);
  };

  const renderer = (props) => {
    let {
      column,
      value,
      groupContinuedMessage,
      groupContinuesMessage,
      text,
      component
    } = props;
    let keys = getKeys(
      groupedData,
      [],
      column.dataField,
      value,
      keyExpr
    );
    let checked = checkIfKeysAreSelected(keys, component.getSelectedRowKeys());
    let groupText = getGroupText(
      column,
      text,
      groupContinuesMessage,
      groupContinuedMessage
    );
    props = {
      checked: checked,
      groupText: groupText,
      onValueChanged: (args) => {
        onValueChanged(args, component, keys);
      }
    };
    return <GroupTemplate {...props} />;
  };
  const onValueChanged = (args, grid, keys) => {
    if (!args.event) return;
    if (args.value) grid.selectRows(keys, true);
    else grid.deselectRows(keys);
  };
  const onContentReady = (args) => {
    if (args.component.isNotFirstLoad) return;
    args.component.isNotFirstLoad = true;
    let ds = args.component.getDataSource();
    ds.store()
      .load(ds.loadOptions())
      .done((r) => {
        setGroupedData(r)
      });
  };



  return (<div>
    <DataGrid onSelectionChanged={onSelectionChanged} onContentReady={onContentReady} keyExpr={keyExpr} columnAutoWidth dataSource={fields} width="100%" height="100%" paging={{ enabled: false }}>
      <Selection mode="multiple" showCheckBoxesMode="always"></Selection>
      <Sorting mode="multiple"></Sorting>
      <Column dataField='ProductID' />
      <Column dataField='ProductName' />
      <Column dataField='Category.CategoryName' />
      <Column dataField='GroupCode' groupIndex="0" groupCellRender={renderer} />
    </DataGrid>

  </div>);
}

export default function Root() {

  return (
    <Router>
      <App />
    </Router>
  );
}
