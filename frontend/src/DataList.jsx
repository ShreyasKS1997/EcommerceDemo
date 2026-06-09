import { useEffect } from 'react';
import './DataList.css';
import Loader from './component/layout/loader/loader';

export const DataList = ({data}) => {

    const excludeData = data.excludeData ?? [];

    let columnLength = data.data.length > 0 ? Object.values(data.data[0]).length : null;
    if (columnLength) {
        if (data.viewDetailsButton) {
            columnLength += 1;
        }

        if (data.ActionButtons?.length > 0) {
            columnLength += 1;
        }

        if (excludeData && excludeData.length > 0) {
            columnLength -= 1;
        }

        if (data.CustomColumnsButton) {
            columnLength += data.CustomColumnsButton.length;
        }
    }

    return (
        <>
            {columnLength ?
                <div style={{gridTemplateColumns: `${data.gridCellTemplateColumn ? 
                        data.gridCellTemplateColumn : 
                        `repeat(${columnLength + 1}, 1fr)`}`}} className="dataObjectArray">

                    <div style={{gridColumn: `span ${columnLength}`}}className='DataListItem largeScreenHeading'>
                        {data.heading?.map((item => <span>{item}</span>))}
                        {data.viewDetailsButton && <span>Action</span>}
                        {
                            data.CustomColumnsButton &&
                            data.CustomColumnsButton.map((item) => {
                                return (
                                    <>
                                        <span>{Object.keys(item).map((key) => key)}</span>
                                    </>
                                )
                            })
                        }
                    </div>
                    {
                        data.data.map((item) => {
                            return (
                                <div style={{gridColumn: `span ${columnLength}`}} className='DataListItem'>
                                    {Object.entries(item).map(([key, value]) => {
                                        if (excludeData.includes(key)) {
                                            return;
                                        }
                                        return (
                                            <>
                                                <span>
                                                    <span className='smallScreenHeading'>{key}:</span>
                                                    <span className={key === 'Status' ? 
                                                            `${value === 'Delivered' ? 
                                                            'green' : value === 'Shipped' ? 
                                                            'orange' : 
                                                            'blue'
                                                        } status` : ''}>
                                                            {key === 'Amount' || key === 'Price' ? `₹${value}` : value}
                                                    </span>
                                                </span>
                                            </>
                                        )
                                    })}
                                    {   
                                        data.viewDetailsButton &&
                                        <span className='viewDetailsButton'>
                                            <span className='smallScreenHeading'>Action:</span>
                                            <button onClick={(e) => data.viewDetailsButtonAction(item, e)}>View Details</button>
                                        </span>
                                    }
                                    
                                    {
                                        data.ActionButtons?.length > 0 &&
                                        <div className='ActionButtons'>
                                            <span className='smallScreenHeading'>Actions:</span>
                                            <div>
                                                {data.ActionButtons.map((itemButton, index) => {
                                                    return (
                                                        
                                                        <button disabled={data.activeUserSandboxId !== item.sandboxId} onClick={(e) => data.ActionButtonsHandler[index](e, item)}>
                                                            {itemButton}
                                                        </button>
                                                        
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    }

                                    {
                                        data.CustomColumnsButton &&
                                        data.CustomColumnsButton.map((itemL, index) => {
                                            return (
                                                <span>
                                                    <span className='smallScreenHeading'>{Object.keys(itemL).map((key) => key)}</span>
                                                    {data.CustomColumnsButton && <button onClick={(e) => data.CustomColumnsButtonClickHandler[index](e, item)} className='customColumnButton'>{Object.values(itemL).map((value) => value)}</button>}
                                                </span>
                                            )
                                        })
                                    }

                                </div>
                            )
                        })
                    }
                </div> :
                <div style={{fontFamily: '"Inter", Arial, Helvetica, sans-serif'}}>No data found</div>
            }
        </>
    )
}