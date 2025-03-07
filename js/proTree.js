(function($) {
    var Tree = function(element, options) {
        this.element = element;
        this.JSONArr = options.arr;
        this.simIcon = options.simIcon || "";
        this.close = options.close || false;
        this.mouIconOpen = options.mouIconOpen || "pt-folder-open";
        this.mouIconClose = options.mouIconClose || "pt-folder-close";
        this.callback = options.callback || function() {};
        this.init();
        this.addCustomStyles(); // 添加自定义样式
    }

    // 添加隔离样式
    Tree.prototype.addCustomStyles = function() {
		var style = `
        /* 强化选中状态样式 */
        .pt-tree-container .pt-node.pt-selected {
            color: #ef4444 !important;
            font-weight: 700 !important;
            position: relative;
        }
		/* 添加选中指示器 */
        .pt-tree-container .pt-node.pt-selected::after {
            content: "";
            position: absolute;
            left: -15px;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background: #ef4444;
            border-radius: 50%;
        }
            .pt-tree-container ul {
                list-style: none;
                margin: 0;
                padding-left: 20px;
            }
            .pt-tree-container li {
                position: relative;
                margin: 4px 0;
            }
            .pt-tree-container li::before {
                content: '';
                position: absolute;
                left: -15px;
                top: 0;
                width: 15px;
                height: 100%;
                border-left: 1px solid #ccc;
            }
            .pt-tree-container li::after {
                content: '';
                position: absolute;
                left: -15px;
                top: 50%;
                width: 15px;
                border-bottom: 1px solid #ccc;
            }
            .pt-tree-container li:last-child::before {
                height: 50%;
            }
            .pt-tree-container .pt-icon {
                margin-right: 6px;
            }

			/* 新增修正样式 */
			.pt-tree-container .pt-icon {
				font-style: normal !important; /* 强制取消斜体 */
				font-family: Arial, sans-serif !important; /* 使用无衬线字体 */
				vertical-align: middle; /* 垂直居中 */
				display: inline-flex;
				align-items: center;
				justify-content: center;
			}

            .pt-tree-container .pt-folder-open::before {
                content: "📂";
				transform: rotate(0deg); /* 明确取消旋转 */
            }
            .pt-tree-container .pt-folder-close::before {
                content: "📁";
				transform: rotate(0deg); /* 明确取消旋转 */
            }
            .pt-tree-container .pt-file::before {
                content: "📄";
				transform: skew(0deg, 0deg); /* 明确取消倾斜 */
            }
			/* 叶节点光标样式 */
			.pt-tree-container li:not(:has(ul)) .pt-node {
				cursor: pointer;
				transition: color 0.2s;
			}
		
			/* 悬停反馈 */
			.pt-tree-container li:not(:has(ul)) .pt-node:hover {
				color: #1d4ed8; /* Tailwind blue-700 */
			}

			/* 在树形结构样式中添加 */
			.pt-tree-container .pt-node.pt-selected {
				font-weight: 600; /* 加粗强调 */
				transition: color 0.2s ease;
			}

        `;
        $('head').append('<style>' + style + '</style>');
    };

    // 初始化事件
    Tree.prototype.init = function() {
        var self = this;
        this.element.addClass('pt-tree-container'); // 添加命名空间
        this.JSONTreeArr = this.proJSON(this.JSONArr, 0);
        this.treeHTML = this.proHTML(this.JSONTreeArr);
        this.element.append(this.treeHTML);
        
        if(this.close){
            this.element.find(".pt-menuUl").find("li").children(".pt-menuUl").hide();
            var i_arr = this.element.find(".pt-menuUl").find("li").find('.pt-icon');
            i_arr.each(function(index,item){
                if($(item).hasClass(self.mouIconOpen)){
                    $(item).removeClass(self.mouIconOpen).addClass(self.mouIconClose)
                }
            })
        }
        this.bindEvent();
    }

    // 生成树形JSON数据（保持不变）
    Tree.prototype.proJSON = function(oldArr, pid) {
        var newArr = [];
        var self = this;
        oldArr.map(function(item) {
            if(item.pid == pid) {
                var obj = { id: item.id, name: item.name };
                var child = self.proJSON(oldArr, item.id);
                if(child.length > 0) obj.child = child;
                newArr.push(obj)
            }
        })
        return newArr;
    };

    // 生成树形HTML（修改类名）
    Tree.prototype.proHTML = function(arr) {
        var ulHtml = "<ul class='pt-menuUl'>";
        var self = this;
        arr.map(function(item) {
            var lihtml = "<li>";
            if(item.child && item.child.length > 0) {
                lihtml += `<i class='pt-icon ${self.mouIconOpen}'></i>` +
                    `<span class='pt-node' id='${item.id}'>${item.name}</span>`;
                lihtml += self.proHTML(item.child) + "</li>";
            } else {
                lihtml += `<i class='pt-icon pt-file'></i>` +
                    `<span class='pt-node' id='${item.id}'>${item.name}</span>`;
            }
            ulHtml += lihtml;
        })
        ulHtml += "</ul>";
        return ulHtml;
    }

    // 绑定事件（修改选择器）
    Tree.prototype.bindEvent = function() {
        var self = this;
        this.element.find(".pt-menuUl li .pt-icon").click(function() {
            var $icon = $(this);
            var menuUl = $icon.closest("li").children(".pt-menuUl");
            
            if(menuUl.is(":visible")) {
                $icon.removeClass(self.mouIconOpen).addClass(self.mouIconClose);
                menuUl.hide();
            } else {
                $icon.removeClass(self.mouIconClose).addClass(self.mouIconOpen);
                menuUl.show();
            }
        });

		this.element.find(".pt-node").click(function (e) {
			e.stopPropagation(); // 阻止事件冒泡
            var id = $(this).attr("id");
            var name = $(this).text();
			self.callback(id, name, $(this));
        })
    }

    $.fn.extend({
        ProTree: function(options) {
            return new Tree($(this), options)
        }
    })
})(jQuery);