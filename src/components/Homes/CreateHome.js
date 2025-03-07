import { useContext, useState } from 'react';
import { hostUrl } from '../../utils/urls';
import InputFormRow from '../../common/InputFormRow';
import FormSubmitButton from '../../common/FormSubmitButton';
import { HOME_FIELDS } from '../../common/fields';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { validateField } from 'common/validation';
import { checkObjForProfanity } from 'common/profanity';

export default function CreateHome() {
    const [homeInfo, setHomeInfo] = useState({});
    const [validationErrors, setValidationErrors] = useState(
        HOME_FIELDS.map((uf) => uf.name).reduce((acc, curr) => ((acc[curr] = ''), acc), {
            description: '',
        })
    );

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const postHome = () => {
        const postBody = { ...homeInfo, owner_id: user.id };
        fetch(`${hostUrl}/home`, {
            method: 'POST',
            body: JSON.stringify(postBody),
            headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((resp) => {
                return resp.json();
            })
            .then((json) => {
                if (json.id) {
                    navigate(`/edit-home?homeId=${json.id}`);
                    return;
                }
                throw new Error();
            });
    };

    const handleValidate = (e) => {
        const valError = validateField(e.target.type, e.target.value);
        if (valError) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: valError,
            });
        } else {
            setValidationErrors((current) => {
                const copy = { ...current };
                delete copy[e.target.name];
                return copy;
            });
        }
    };

    const handleOnChange = (e) => {
        setHomeInfo({
            ...homeInfo,
            [e.target.name]: e.target.value,
        });
        handleValidate(e);
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(validationErrors).length > 0) {
            import('react-toastify').then((module) =>
                module.toast.error('Please enter valid values!', {
                    autoClose: 3000,
                    pauseOnHover: false,
                })
            );
            return;
        }
        if (checkObjForProfanity(homeInfo)) return;
        postHome();
    };

    const handleOnPhotoUpload = (e) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setHomeInfo({
                ...homeInfo,
                [e.target.name]: reader.result,
            });
        };
        if (e.target.files) {
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="center">
            <form onSubmit={handleOnSubmit} data-testid="home-create-form">
                <article style={{ margin: 'auto', width: '300px' }}>
                    <input data-testid="home-photo" type="file" name="photo" onChange={handleOnPhotoUpload} />
                </article>

                {HOME_FIELDS.map((hk) => (
                    <InputFormRow
                        key={hk.labelName}
                        labelName={hk.labelName}
                        name={hk.name}
                        value={homeInfo[hk.name]}
                        type={hk.type}
                        handleOnChange={handleOnChange}
                        validationError={validationErrors[hk.name]}
                        dataTestId={hk.name}
                    />
                ))}

                <article className="form-row">
                    <label>Description</label>
                    <textarea
                        type="text"
                        name="description"
                        data-testid="description"
                        value={homeInfo.description || ''}
                        onChange={handleOnChange}
                    />
                </article>

                <FormSubmitButton />
            </form>
        </div>
    );
}
