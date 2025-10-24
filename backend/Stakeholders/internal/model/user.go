package model

const (
	UserRoleTourist       = "tourist"
	UserRoleAdministrator = "administrator"
	UserRoleAuthor        = "author"
)

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Blocked  bool   `json:"blocked"`
}

func (u *User) GetPrimaryRoleName() string {
	return u.Role
}

type CredentialsDto struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AccountRegistrationDto struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type AuthenticationTokensDto struct {
	AccessToken string `json:"accessToken"`
}
