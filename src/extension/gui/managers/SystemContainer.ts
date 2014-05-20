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

/// <reference path="../../../egret/display/DisplayObjectContainer.ts"/>
/// <reference path="../core/IContainer.ts"/>
/// <reference path="../core/IVisualElement.ts"/>
/// <reference path="ISystemManager.ts"/>

module ns_egret {

	/**
	 * @class ns_egret.SystemContainer
	 * @classdesc
	 * SystemManager的虚拟子容器
	 * @implements ns_egret.IContainer
	 */
	export class SystemContainer implements IContainer{
		/**
		 * 构造函数
		 * @method ns_egret.SystemContainer#constructor
		 * @param owner {ISystemManager} 
		 * @param lowerBoundReference {string} 
		 * @param upperBoundReference {strin} 
		 */		
		public constructor(owner:ISystemManager,
										lowerBoundReference:string,
										upperBoundReference:string){
			this.owner = owner;
			this.lowerBoundReference = lowerBoundReference;
			this.upperBoundReference = upperBoundReference;
		}
		/**
		 * 实体容器
		 */		
		private owner:ISystemManager;
		
		/**
		 * 容器下边界属性
		 */		
		private lowerBoundReference:string;
		
		/**
		 * 容器上边界属性
		 */		
		private upperBoundReference:string;
		/**
		 * @member ns_egret.SystemContainer#numElements
		 */
		public get numElements():number{
			return this.owner[this.upperBoundReference] - this.owner[this.lowerBoundReference];
		}
		
		private raw_getElementAt:string = "raw_getElementAt";
		private raw_addElementAt:string = "raw_addElementAt";
		private raw_getElementIndex:string = "raw_getElementIndex";
		private raw_removeElement:string = "raw_removeElement";
		private raw_removeElementAt:string = "raw_removeElementAt";
		private raw_setElementIndex:string = "raw_setElementIndex";
		/**
		 * @method ns_egret.SystemContainer#getElementAt
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public getElementAt(index:number):IVisualElement{
			var retval:IVisualElement =
				this.owner[this.raw_getElementAt](
					this.owner[this.lowerBoundReference] + index);
			return retval;
		}
		/**
		 * @method ns_egret.SystemContainer#addElement
		 * @param element {IVisualElement} 
		 * @returns {IVisualElement}
		 */
		public addElement(element:IVisualElement):IVisualElement{
			var index:number = this.owner[this.upperBoundReference];
			if(element.parent===(<DisplayObjectContainer><any> this.owner))
				index--;
			this.owner[this.upperBoundReference]++;
			this.owner[this.raw_addElementAt](element,index);
			element.ownerChanged(this);
			return element;
		}
		/**
		 * @method ns_egret.SystemContainer#addElementAt
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public addElementAt(element:IVisualElement, index:number):IVisualElement{
			this.owner[this.upperBoundReference]++;
			this.owner[this.raw_addElementAt](
				element, this.owner[this.lowerBoundReference] + index);
			element.ownerChanged(this);
			return element;
		}
		/**
		 * @method ns_egret.SystemContainer#removeElement
		 * @param element {IVisualElement} 
		 * @returns {IVisualElement}
		 */
		public removeElement(element:IVisualElement):IVisualElement{
			var index:number = this.owner[this.raw_getElementIndex](element);
			if (this.owner[this.lowerBoundReference] <= index &&
				index < this.owner[this.upperBoundReference]){
				this.owner[this.raw_removeElement](element);
				this.owner[this.upperBoundReference]--;
			}
			element.ownerChanged(null);
			return element;
		}
		/**
		 * @method ns_egret.SystemContainer#removeElementAt
		 * @param index {number} 
		 * @returns {IVisualElement}
		 */
		public removeElementAt(index:number):IVisualElement{
			index += this.owner[this.lowerBoundReference];
			var element:IVisualElement;
			if (this.owner[this.lowerBoundReference] <= index &&
				index < this.owner[this.upperBoundReference]){
				element = this.owner[this.raw_removeElementAt](index);
				this.owner[this.upperBoundReference]--;
			}
			element.ownerChanged(null);
			return element;
		}
		/**
		 * @method ns_egret.SystemContainer#getElementIndex
		 * @param element {IVisualElement} 
		 * @returns {number}
		 */
		public getElementIndex(element:IVisualElement):number{
			var retval:number = this.owner[this.raw_getElementIndex](element);
			retval -= this.owner[this.lowerBoundReference];
			return retval;
		}
		/**
		 * @method ns_egret.SystemContainer#setElementIndex
		 * @param element {IVisualElement} 
		 * @param index {number} 
		 */
		public setElementIndex(element:IVisualElement, index:number):void{
			this.owner[this.raw_setElementIndex](
				element, this.owner[this.lowerBoundReference] + index);
		}
	}
}