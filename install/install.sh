#!/usr/bin/env bash

{ # this ensures the entire script is downloaded #

_has_command() {
  type "$1" > /dev/null 2>&1
}

_echo() {
  command printf %s\\n "$*" 2>/dev/null
}

if [ -z "${BASH_VERSION}" ] || [ -n "${ZSH_VERSION}" ]; then
  # shellcheck disable=SC2016
  _echo >&2 'Error: please pipe the installation script to `bash`'
  exit 1
fi

_grep() {
  GREP_OPTIONS='' command grep "$@"
}


_default_install_dir() {
  [ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.uberboard" || printf %s "${XDG_CONFIG_HOME}/uberboard"
}

_latest_version() {
  _echo "stable"
}
_install_dir() {
  if [ -n "$UBERBOARD_DIR" ]; then
    printf %s "${UBERBOARD_DIR}"
  else
    _default_install_dir
  fi
}

_profile_is_bash_or_zsh() {
  local TEST_PROFILE
  TEST_PROFILE="${1-}"
  case "${TEST_PROFILE-}" in
    *"/.bashrc" | *"/.bash_profile" | *"/.zshrc" | *"/.zprofile")
      return
    ;;
    *)
      return 1
    ;;
  esac
}

_download() {
  if _has_command "curl"; then
    curl --fail --compressed -q "$@"
  elif _has_command "wget"; then
    # Emulate curl with wget
    ARGS=$(_echo "$@" | command sed -e 's/--progress-bar /--progress=bar /' \
                            -e 's/--compressed //' \
                            -e 's/--fail //' \
                            -e 's/-L //' \
                            -e 's/-I /--server-response /' \
                            -e 's/-s /-q /' \
                            -e 's/-sS /-nv /' \
                            -e 's/-o /-O /' \
                            -e 's/-C - /-c /')
    # shellcheck disable=SC2086
    eval wget $ARGS
  fi
}

install_uberboard() {
  local INSTALL_DIR
  INSTALL_DIR="$(_install_dir)"

  local FILENAME
  local OS
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  local ARCH
  ARCH=$(arch)
  FILENAME="uberboard-${OS}-${ARCH}.tar.gz"

  local UBERBOARD_CLI_URL="https://s3.eu-central-1.amazonaws.com/releases-uberboard-cli/channels/stable/${FILENAME}"

  # Downloading to $INSTALL_DIR
  mkdir -p "$INSTALL_DIR"
  if [ -f "$INSTALL_DIR/package.json" ]; then
    _echo "=> uberboard CLI is already installed in $INSTALL_DIR, running update instead..."
  else
    _echo "=> Downloading uberboard CLI to '$INSTALL_DIR'"
  fi
  _download  --progress-bar "$UBERBOARD_CLI_URL" -o "$INSTALL_DIR/${FILENAME}" || {
    _echo >&2 "Failed to download '$UBERBOARD_CLI_URL'"
    return 1
  } &
  for job in $(jobs -p | command sort)
  do
    wait "$job" || return $?
  done
  tar xzf "$INSTALL_DIR/${FILENAME}" -C "$INSTALL_DIR" --strip 1 && rm -f "$INSTALL_DIR/${FILENAME}"
  chmod a+x "$INSTALL_DIR/bin/uberboard" || {
    _echo >&2 "Failed to mark '$INSTALL_DIR/bin/uberboard' as executable"
    return 3
  }
  _echo "Successfully installed uberboard!"
  _echo "You should add uberboard's 'bin' directory to the PATH environment variable by executing the following line:"
  _echo "export PATH=\$PATH:$HOME/.uberboard/bin"
  _echo "Alternatively, you can use the command $HOME/.uberboard/bin/uberboard directly."
  _echo ""
  _echo "try $HOME/.uberboard/bin/uberboard dashboard create"
}

install_uberboard

}
