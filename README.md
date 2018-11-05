# mine-sweeper

[![Dependency Status](https://david-dm.org/plantain-00/mine-sweeper.svg)](https://david-dm.org/plantain-00/mine-sweeper)
[![devDependency Status](https://david-dm.org/plantain-00/mine-sweeper/dev-status.svg)](https://david-dm.org/plantain-00/mine-sweeper#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/mine-sweeper.svg?branch=master)](https://travis-ci.org/plantain-00/mine-sweeper)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/mine-sweeper?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/mine-sweeper/branch/master)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fmine-sweeper%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/mine-sweeper)

A mine sweeper game.

## todo

+ if A, B, C have 3 mines, then any 2 of them have 1 or 2 mines
+ if part of unknown positions have the same mine count as total mine count, then the rest unknown postions are all not mines
+ assume a unknown position is mine, then infer something that is conflict with facts, then the position is not mine
