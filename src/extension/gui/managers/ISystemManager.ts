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

/// <reference path="../../../egret/display/Stage.ts"/>
/// <reference path="../../../egret/events/IEventDispatcher.ts"/>
/// <reference path="../core/IContainer.ts"/>

module ns_egret {

	/**
	 * @class ns_egret.ISystemManager
	 * @interface
	 * @classdesc
	 * @extends ns_egret.IEventDispatcher
	 */
	export interface ISystemManager extends IEventDispatcher{
		/**
		 * 弹出窗口层容器。
		 * @member ns_egret.ISystemManager#popUpContainer
		 */	
		popUpContainer:IContainer;
		/**
		 * 工具提示层容器。
		 * @member ns_egret.ISystemManager#toolTipContainer
		 */		
		toolTipContainer:IContainer;
		/**
		 * 鼠标样式层容器。
		 * @member ns_egret.ISystemManager#cursorContainer
		 */		
		cursorContainer:IContainer;
		/**
		 * 舞台引用
		 * @member ns_egret.ISystemManager#stage
		 */		
		stage:Stage;
	}
}