2025-08-11      20:04

Status: #Unfinished 

Tags: [[LLM]]  [[Agent]]

# Smolagents的工作流
1.工作流的定义
将人类语言定义的模糊任务，转化为机器可以执行的工作流。
 
2.Smolagents如何实现工作流？
主要通过两个核心类来实现：CodeAgent和ToolCallingAgent，其中CodeAgent是动态生成python代码的Agent，而ToolCallingAgent是生成结构化的json指令。

3.什么是CodeAgent？
动态生成代码的类。
过程可以概括为：
(1)理解任务：由LLM完成对问题的理解。
(2)生成代码：由LLM生成和问题对应的代码。
(3)执行代码：在Smolagents框架之中，由local_python_executor.py实现，这里Smolagents框架提供了两种开箱即用的沙盒方案。
一是使用docker来实现，即在Agent初始化时：
```python
agent = CodeAgent(

    tools=[],

    model=model,

    executor_type="docker"  # <-- 关键在这里！

)
```
二是利用
```python

```
# References





