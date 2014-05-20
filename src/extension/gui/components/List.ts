/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="../../../egret/display/DisplayObject.ts"/>
/// <reference path="../../../egret/events/Event.ts"/>
/// <reference path="../../../egret/events/TouchEvent.ts"/>
/// <reference path="DataGroup.ts"/>
/// <reference path="IItemRenderer.ts"/>
/// <reference path="supportClasses/ListBase.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="../core/UIGlobals.ts"/>
/// <reference path="../events/IndexChangeEvent.ts"/>
/// <reference path="../events/ListEvent.ts"/>
/// <reference path="../events/RendererExistenceEvent.ts"/>
/// <reference path="../events/UIEvent.ts"/>

module ns_egret {

	/**
	 * @class ns_egret.List
	 * @classdesc
	 * 列表组件
	 * @extends ns_egret.ListBase
	 */
	export class List extends ListBase{
		/**
		 * @method ns_egret.List#constructor
		 */
		public constructor(){
			super();
			this.useVirtualLayout = true;
		}
		
		/**
		 * @method ns_egret.List#createChildren
		 */
		public createChildren():void{
			if(!this.itemRenderer)
				this.itemRenderer = DataGroup.defaultRendererFactory;
			super.createChildren();
		}
		
		/**
		 * 是否使用虚拟布局,默认true
		 * @member ns_egret.List#useVirtualLayout
		 */		
		public get useVirtualLayout():boolean{
			return this._getUseVirtualLayout();
		}
		
		/**
		 * @inheritDoc
		 */
		public set useVirtualLayout(value:boolean){
			this._setUseVirtualLayout(value);
		}
		
		
		private _allowMultipleSelection:boolean = false;
		/**
		 * 是否允许同时选中多项
		 * @member ns_egret.List#allowMultipleSelection
		 */
		public get allowMultipleSelection():boolean{
			return this._allowMultipleSelection;
		}

		public set allowMultipleSelection(value:boolean){
			this._allowMultipleSelection = value;
		}

		private _selectedIndices:Array<number> = [];
		
		private _proposedSelectedIndices:Array<number>;
		/**
		 * 当前选中的一个或多个项目的索引列表
		 * @member ns_egret.List#selectedIndices
		 */		
		public get selectedIndices():Array<number>{
			if(this._proposedSelectedIndices)
				return this._proposedSelectedIndices;
			return this._selectedIndices;
		}

		public set selectedIndices(value:Array<number>){
			this._setSelectedIndices(value, false);
		}
		/**
		 * @member ns_egret.List#selectedIndex
		 */
		public get selectedIndex():number{
			if(this._proposedSelectedIndices){
				if(this._proposedSelectedIndices.length>0)
					return this._proposedSelectedIndices[0];
				return -1;
			}
			return this._getSelectedIndex();
		}

        public set selectedIndex(value:number){
            this._setSelectedIndex(value);
        }
		
		/**
		 * 当前选中的一个或多个项目的数据源列表
		 * @member ns_egret.List#selectedItems
		 */		
		public get selectedItems():Array<Object>{
			var result:Array<Object> = [];
			var list:Array<number> = this.selectedIndices;
			if (list){
				var count:number = list.length;

				for (var i:number = 0; i < count; i++)
					result[i] = this.dataProvider.getItemAt(list[i]);
			}

			return result;
		}

		public set selectedItems(value:Array<Object>){
			var indices:Array<number> = [];

			if (value){
				var count:number = value.length;

				for (var i:number = 0; i < count; i++){
					var index:number = this.dataProvider.getItemIndex(value[i]);
					if (index != -1){
						indices.splice(0, 0, index);
					}
					if (index == -1){
						indices = [];
						break;
					}
				}
			}
			this._setSelectedIndices(indices,false);
		}
		/**
		 * 设置多个选中项
		 */
		public _setSelectedIndices(value:Array<number>, dispatchChangeEvent:boolean = false):void{
			if (dispatchChangeEvent)
				this.dispatchChangeAfterSelection = (this.dispatchChangeAfterSelection || dispatchChangeEvent);

			if (value)
				this._proposedSelectedIndices = value;
			else
				this._proposedSelectedIndices = [];
			this.invalidateProperties();
		}

		/**
		 * @method ns_egret.List#commitProperties
		 */
		public commitProperties():void{
			super.commitProperties();
			if (this._proposedSelectedIndices){
				this.commitSelection();
			}
		}
		/**
		 * @method ns_egret.List#commitSelection
		 * @param dispatchChangedEvents {boolean} 
		 * @returns {boolean}
		 */
		public commitSelection(dispatchChangedEvents:boolean = true):boolean{
			var oldSelectedIndex:number = this._selectedIndex;
			if(this._proposedSelectedIndices){
				this._proposedSelectedIndices = this._proposedSelectedIndices.filter(this.isValidIndex);

				if (!this.allowMultipleSelection && this._proposedSelectedIndices.length>0){
					var temp:Array<number> = [];
					temp.push(this._proposedSelectedIndices[0]);
					this._proposedSelectedIndices = temp;
				}
				if (this._proposedSelectedIndices.length>0){
					this._proposedSelectedIndex = this._proposedSelectedIndices[0];
				}
				else{
					this._proposedSelectedIndex = -1;
				}
			}

			var retVal:boolean = super.commitSelection(false);

			if (!retVal){
				this._proposedSelectedIndices = null;
				return false;
			}

			if (this.selectedIndex > ListBase.NO_SELECTION){
				if (this._proposedSelectedIndices){
					if(this._proposedSelectedIndices.indexOf(this.selectedIndex) == -1)
						this._proposedSelectedIndices.push(this.selectedIndex);
				}
				else{
					this._proposedSelectedIndices = [this.selectedIndex];
				}
			}

			if(this._proposedSelectedIndices){
				if(this._proposedSelectedIndices.indexOf(oldSelectedIndex)!=-1)
					this.itemSelected(oldSelectedIndex,true);
				this.commitMultipleSelection();
			}

			if (dispatchChangedEvents && retVal){
				var e:IndexChangeEvent;

				if (this.dispatchChangeAfterSelection){
					e = new IndexChangeEvent(IndexChangeEvent.CHANGE);
					e.oldIndex = oldSelectedIndex;
					e.newIndex = this._selectedIndex;
					this.dispatchEvent(e);
					this.dispatchChangeAfterSelection = false;
				}

				this.dispatchEvent(new UIEvent(UIEvent.VALUE_COMMIT));
			}

			return retVal;
		}
		/**
		 * 是否是有效的索引
		 */
		private isValidIndex(item:number, index:number, v:Array<number>):boolean{
			return this.dataProvider && (item >= 0) && (item < this.dataProvider.length);
		}
		/**
		 * 提交多项选中项属性
		 * @method ns_egret.List#commitMultipleSelection
		 */
		public commitMultipleSelection():void{
			var removedItems:Array<number> = [];
			var addedItems:Array<number> = [];
			var i:number;
			var count:number;

			if (this._selectedIndices.length>0&& this._proposedSelectedIndices.length>0){
				count = this._proposedSelectedIndices.length;
				for (i = 0; i < count; i++){
					if (this._selectedIndices.indexOf(this._proposedSelectedIndices[i]) == -1)
						addedItems.push(this._proposedSelectedIndices[i]);
				}
				count = this._selectedIndices.length;
				for (i = 0; i < count; i++){
					if (this._proposedSelectedIndices.indexOf(this._selectedIndices[i]) == -1)
						removedItems.push(this._selectedIndices[i]);
				}
			}
			else if (this._selectedIndices.length>0){
				removedItems = this._selectedIndices;
			}
			else if (this._proposedSelectedIndices.length>0){
				addedItems = this._proposedSelectedIndices;
			}

			this._selectedIndices = this._proposedSelectedIndices;

			if (removedItems.length > 0){
				count = removedItems.length;
				for (i = 0; i < count; i++){
					this.itemSelected(removedItems[i], false);
				}
			}

			if (addedItems.length>0){
				count = addedItems.length;
				for (i = 0; i < count; i++){
					this.itemSelected(addedItems[i], true);
				}
			}

			this._proposedSelectedIndices = null;
		}

		/**
		 * @method ns_egret.List#isItemIndexSelected
		 * @param index {number} 
		 * @returns {boolean}
		 */
		public isItemIndexSelected(index:number):boolean{
			if (this._allowMultipleSelection)
				return this._selectedIndices.indexOf(index) != -1;

			return super.isItemIndexSelected(index);
		}

		/**
		 * @method ns_egret.List#dataGroup_rendererAddHandler
		 * @param event {RendererExistenceEvent} 
		 */
		public dataGroup_rendererAddHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererAddHandler(event);

			var renderer:DisplayObject = <DisplayObject><any> (event.renderer);
			if (renderer == null)
				return;

			renderer.addEventListener(TouchEvent.TOUCH_BEGAN, this.item_mouseDownHandler, this);
			//由于ItemRenderer.mouseChildren有可能不为false，在鼠标按下时会出现切换素材的情况，
			//导致target变化而无法抛出原生的click事件,所以此处监听MouseUp来抛出ItemClick事件。
			renderer.addEventListener(TouchEvent.TOUCH_END, this.item_mouseUpHandler, this);
		}

		/**
		 * @method ns_egret.List#dataGroup_rendererRemoveHandler
		 * @param event {RendererExistenceEvent} 
		 */
		public dataGroup_rendererRemoveHandler(event:RendererExistenceEvent):void{
			super.dataGroup_rendererRemoveHandler(event);

			var renderer:DisplayObject = <DisplayObject><any> (event.renderer);
			if (renderer == null)
				return;

			renderer.removeEventListener(TouchEvent.TOUCH_BEGAN, this.item_mouseDownHandler, this);
			renderer.removeEventListener(TouchEvent.TOUCH_END, this.item_mouseUpHandler, this);
		}
		/**
		 * 是否捕获ItemRenderer以便在MouseUp时抛出ItemClick事件
		 * @member ns_egret.List#captureItemRenderer
		 */
		public captureItemRenderer:boolean = true;

		private mouseDownItemRenderer:IItemRenderer;
		/**
		 * 鼠标在项呈示器上按下
		 * @method ns_egret.List#item_mouseDownHandler
		 * @param event {TouchEvent} 
		 */
		public item_mouseDownHandler(event:TouchEvent):void{
			if (event.isDefaultPrevented())
				return;

			var itemRenderer:IItemRenderer = <IItemRenderer> (event.currentTarget);
			var newIndex:number;
			if (itemRenderer)
				newIndex = itemRenderer.itemIndex;
			else
				newIndex = this.dataGroup.getElementIndex(<IVisualElement> (event.currentTarget));
			if(this._allowMultipleSelection){
				this._setSelectedIndices(this.calculateSelectedIndices(newIndex, event.shiftKey, event.ctrlKey), true);
			}
			else{
				this._setSelectedIndex(newIndex, true);
			}
			if(!this.captureItemRenderer)
				return;
			this.mouseDownItemRenderer = itemRenderer;
			UIGlobals.stage.addEventListener(TouchEvent.TOUCH_END,this.stage_mouseUpHandler,this);
			UIGlobals.stage.addEventListener(Event.LEAVE_STAGE,this.stage_mouseUpHandler,this);
		}
		/**
		 * 计算当前的选中项列表
		 */
		private calculateSelectedIndices(index:number, shiftKey:boolean, ctrlKey:boolean):Array<number>{
			var i:number;
			var interval:Array<number> = [];
			if (!shiftKey){
				if(ctrlKey){
					if (this._selectedIndices.length>0){
						if (this._selectedIndices.length == 1 && (this._selectedIndices[0] == index)){
							if (!this.requireSelection)
								return interval; 
							
							interval.splice(0, 0, this._selectedIndices[0]); 
							return interval; 
						}
						else{
							var found:boolean = false; 
							for (i = 0; i < this._selectedIndices.length; i++){
								if (this._selectedIndices[i] == index)
									found = true; 
								else if (this._selectedIndices[i] != index)
									interval.splice(0, 0, this._selectedIndices[i]);
							}
							if (!found){
								interval.splice(0, 0, index);   
							}
							return interval; 
						} 
					}
					else{ 
						interval.splice(0, 0, index); 
						return interval; 
					}
				}
				else { 
					interval.splice(0, 0, index); 
					return interval; 
				}
			}
			else {
				var start:number = this._selectedIndices.length>0 ? this._selectedIndices[this._selectedIndices.length - 1] : 0; 
				var end:number = index; 
				if (start < end){
					for (i = start; i <= end; i++){
						interval.splice(0, 0, i); 
					}
				}
				else {
					for (i = start; i >= end; i--){
						interval.splice(0, 0, i); 
					}
				}
				return interval; 
			}
		}

		/**
		 * 鼠标在项呈示器上弹起，抛出ItemClick事件。
		 */	
		private item_mouseUpHandler(event:TouchEvent):void{
			var itemRenderer:IItemRenderer = <IItemRenderer> (event.currentTarget);
			if(itemRenderer!=this.mouseDownItemRenderer)
				return;
			this.dispatchListEvent(event,ListEvent.ITEM_CLICK,itemRenderer);
		}
		
		/**
		 * 鼠标在舞台上弹起
		 */		
		private stage_mouseUpHandler(event:Event):void{
			UIGlobals.stage.removeEventListener(TouchEvent.TOUCH_END,this.stage_mouseUpHandler,this);
			UIGlobals.stage.removeEventListener(Event.LEAVE_STAGE,this.stage_mouseUpHandler,this);
			this.mouseDownItemRenderer = null;
		}
	}
}