import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import React, { useRef, useState } from 'react';
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
  const grid = useRef(null);

  const getCountOfItems = (topItem) => {
    let count = 0;
    if (topItem.items) {

      for (var o = 0; o < topItem.items.length; o++) {
        count += getCountOfItems(topItem.items[o])
      }

    }
    if (topItem.length) {
      count += topItem.length;
    } else {
      if (!topItem.key)
        count++;
    }

    return count;
  }

  const checkIfChildrenAreSelected = (currentKeys, selectedKeys) => {
    let count = 0;
    if (!currentKeys) { return true; }
    if (selectedKeys.length === 0) return false;

    count = isSelected(currentKeys, selectedKeys)

    let optCount = 0;
    if (currentKeys.items) {

      currentKeys.items.foreach(x => optCount += getCountOfItems(x))
    } else {
      for (var o = 0; o < currentKeys.length; o++) {
        optCount += getCountOfItems(currentKeys[o])
      }
    }

    if (count === 0) return false;
    if (optCount === count) return true;
    else return undefined;
  }

  const isSelected = (items, selectedKeys) => {
    var count = 0;
    if (!items) { return }
    if (items.items) {
      count += isSelected(items.items, selectedKeys);
    } else {
      for (var o = 0; o < items.length; o++) {
        var itemsOfGroupKey = items[o].items;
        if (itemsOfGroupKey) {
          count += isSelected(itemsOfGroupKey, selectedKeys)
        }
      }
    }
    for (var i = 0; i < items.length; i++) {
      var keyValue = items[i];
      if (selectedKeys.indexOf(keyValue.ProductID) > -1) {
        count++;
      }

    }
    return count;

  }

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

  const getAllItems = (data) => {
    let keys = data.items;
    if (data.collapsedItems) {
      if (!keys) {
        keys = [...data.collapsedItems];
      } else {
        keys = [...data.items, ...data.collapsedItems];
      }

    }
    return keys;
  }

  const renderer = (props) => {
    let {
      column,
      value,
      groupContinuedMessage,
      groupContinuesMessage,
      text,
      component
    } = props;

    let keys = getAllItems(props.data)
    console.log("selected", component.getSelectedRowKeys())
    let checked = checkIfChildrenAreSelected(keys, component.getSelectedRowKeys(), value, keyExpr);
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

  const recursiveSelect = (topItem) => {
    console.log("topItem",topItem);
    let idsToSelect = [];
    if (topItem.items) {
      //select items
      let toSelect = topItem.items.filter(x => x.ProductID !== undefined).map(x => x.ProductID);
      console.log("toSelect",toSelect);
      idsToSelect = [...idsToSelect, ...toSelect];
      console.log("toSelect", toSelect)

      for (let o = 0; o < topItem.items.length; o++) {
        idsToSelect = [...idsToSelect, ...recursiveSelect(topItem.items[o])];
      }

    }else if (topItem.ProductID){
      idsToSelect = [...idsToSelect, ...[topItem.ProductID]];
    }else if(topItem.length){
      for (let o = 0; o < topItem.length; o++) {
        idsToSelect = [...idsToSelect, ...recursiveSelect(topItem[o])];
      }
    }
    console.log("recursiveIds",idsToSelect)
    return idsToSelect;
  }


  const onValueChanged = (args, grid, keys) => {
    console.log("keys",keys)

    if (args.event === undefined) {
      return;
    }
    if (args.value) {
      let idsToSelect = grid.getSelectedRowKeys();
      if(keys.length){
        for (let o = 0; o < keys.length; o++) {
          console.log(o);
          console.log("keys2",keys)
          console.log("key",keys[o])
          idsToSelect = [...idsToSelect, ...recursiveSelect(keys[o])];
        }

      }else{
        idsToSelect = [...idsToSelect,...recursiveSelect(keys)];
      }
      console.log("idsToSelect", idsToSelect)
      grid.selectRows(idsToSelect);
    }
    else { 
      let idsToDeselect = [];

      if(keys.length){
        for (let o = 0; o < keys.length; o++) {
          console.log(o);
          console.log("keys2",keys)
          console.log("key",keys[o])
          idsToDeselect = [...idsToDeselect, ...recursiveSelect(keys[o])];
        }

      }else{
        idsToDeselect = [...idsToDeselect,...recursiveSelect(keys)];
      }
      console.log("idsToSelect", idsToDeselect)
      grid.deselectRows(idsToDeselect);
    }
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
    <DataGrid ref={grid} onSelectionChanged={onSelectionChanged} onContentReady={onContentReady} keyExpr={keyExpr} columnAutoWidth dataSource={fields} width="100%" height="100%" paging={{ enabled: false }}>
      <Selection mode="multiple" showCheckBoxesMode="always"></Selection>
      <Sorting mode="multiple"></Sorting>
      <Column dataField='ProductID' />
      <Column dataField='ProductName' />
      <Column dataField='Category.CategoryName' groupIndex="0" groupCellRender={renderer} />
      <Column dataField='GroupCode' groupIndex="1" groupCellRender={renderer} />
      <Column dataField='ThirdGroup' groupIndex="2" groupCellRender={renderer} />
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
