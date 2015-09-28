## Steel
Javascript GridView library with paging, sorting, editing. Getting data from various sorces.

## Features
* Data obtained from any of *data providers*. They can load data from server, static arrays, etc. 
* Paging
* Sorting
* Filters
* Insert / edit / delete records.
* Customizable render of rows, cells, etc.
* Support of edit of various types of data: listbox, date, ordinary string (complete list in <code>Steel__ENUM_CELL_EDITOR_TYPE</code>); or implement custom editor (only need to implement 2 functions)


## Data providers
<code>Steel__Grid</code> can obtain data from different types of sources: request data from server (<code>Steel__DataProviderAjax</code>) or static javascript arrays (<code>Steel__DataProviderStatic</code>)

To obtain data (or to push data changes) grid generating *requests* and send it to *data provider*. Then *data provider* doing actual work with data and returning *responses* back to grid.
Types of *requests*: fetch data, insert record, update, delete (types listed at <code>Steel__ENUM_PACKET_CLIENT_OPERATION</code>):
See [test_ajax.php](https://github.com/sharpensteel/Steel/tree/master/tests/test_ajax.php) how to implement **server backend** of <code>Steel__DataProviderAjax</code> 


## Requirements


jQuery library (tested on v1.11+)


Library written in JavaScript ES6. 
To support brosers that currently not support ES6 (FF, IE, Safary), compilers/polyfills should be used. Compiler [babel](https://babeljs.io/) can be used.

Utility [load_scripts_es6.js](https://github.com/sharpensteel/Steel/tree/master/utils/load_scripts_es6.js) helps to seamlessly work with all browsers, look at [samples](https://github.com/sharpensteel/Steel/tree/master/samples).
It uses babel compiler in not-ES6 browsers, or loads scripts directly in ES6-browsers (which is faster a lot).  
    

Number of HTML5 features used:
* \<input type='date'\> - (currently Chrome only support)
* \<input type='color'\> - (currently no IE support)
* \<input type='datetime-local'\> - (currently Chrome only support)
You need use polyfills if you intend to use those features

 
## Feedback
Feel free to contact me, sharpensteel@gmail.com
