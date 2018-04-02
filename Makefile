WINRES:=windres
RM:= rm -rf
STRIP:=strip
MAKE:=make
LUATOOLS=""

ifeq ($(shell uname), Linux)
  CC:=gcc
  CPP:=g++
  BISON:=bison
  LEX:=flex
  LUATOOLS=linlua
  CP = cp
else
  CC:=mingw32-gcc
  CPP:=mingw32-g++
  WINRES:=windres
  LUATOOLS=win32lua
  CP = cp
endif
MKDIR_P = mkdir -p

SRCDIR:=src
OBJDIR:=obj
TOOLDIR:=tools

.PHONY: help
help:
$(info ************  HERE GOES HELP ************)

.PHONY: srcbuild
srcbuild:
$(info ************  Building source ************)

.PHONY: webbuild
webbuild:
$(info ************  Building web ************)

.PHONY: upload
upload:
$(info ************  Uploading files to the target ************)

.PHONY: prepare
prepare:
$(info ************  Preparing files ************)

.PHONY: test
test:
$(info ************  Staring tests ************)

.PHONY: all
all: dirs srcbuild webbuild prepare upload

.PHONY: dirs
dirs: 
	mkdir -p $(OBJDIR) 
	mkdir -p $(TOOLDIR)

.PHONY: clean
clean:
	$(MAKE) -C external/lua/src clean
	$(RM) $(OBJ)
	$(RM) $(OBJDIR)
	$(RM) $(TOOLDIR)	
