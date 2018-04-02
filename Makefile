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
  BISON:=external/win_bison.exe
  LEX:=external/win_flex.exe
  LUATOOLS=win32lua
  CP = cp
endif
MKDIR_P = mkdir -p

SRCDIR:=src
OBJDIR:=obj
TOOLDIR:=tools

SRC:=

OBJ:=$(SRC:%.c=$(OBJDIR)/%.o)

FLAGS:=-ffunction-sections -fdata-sections -Iinclude/emucore -Iinclude/asmdasm -Isrc/asmdasm -Iexternal/lua/src
CFLAGS+=-std=gnu99 $(FLAGS)
CXXFLAGS+=-std=c++11 $(FLAGS)
LDFLAGS:=-Wl,--gc-sections
LDFLAGS+=external/lua/src/liblua.a -lm

.PHONY: all
all: FLAGS+=-O3
all: dirs
all: $(LUATOOLS)

.PHONY: debug
debug: FLAGS+=-O0 -g
debug: dirs
debug: $(LUATOOLS)

.PHONY: dirs
dirs: 
	mkdir -p $(OBJDIR) 
	mkdir -p $(TOOLDIR)

  
$(OBJDIR)/%.o: %.c
	$(MKDIR_P) `dirname $@`
	$(CC) -c -o $@ $< $(CFLAGS)

$(OBJDIR)/%.o: %.cc
	$(MKDIR_P) `dirname $@`
	$(CPP) -c -o $@ $< $(CXXFLAGS)

$(OBJDIR):
	$(MKDIR_P) $(OBJDIR)

.PHONY: linlua
linlua:
	$(MAKE) -C external/lua/src linux
	$(CP) external/lua/src/luac.exe tools/

.PHONY: win32lua
win32lua:
	$(MAKE) -C external/lua/src win32
	$(CP) external/lua/src/luac.exe tools/


.PHONY: clean
clean:
	$(MAKE) -C external/lua/src clean
	$(RM) $(OBJ)
	$(RM) $(OBJDIR)
	$(RM) $(TOOLDIR)	
